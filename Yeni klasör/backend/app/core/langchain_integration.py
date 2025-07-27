from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate, ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from langchain.chains import LLMChain
from langchain.agents import AgentType, initialize_agent, Tool
from langchain.memory import ConversationBufferMemory
from langchain.output_parsers import PydanticOutputParser
from app.core.config import settings
from typing import Optional, List, Dict, Any, Type, TypeVar
from pydantic import BaseModel, Field
from enum import Enum
import json
import re

T = TypeVar('T', bound=BaseModel)

# Pydantic Schemas
class QuestionOption(BaseModel):
    """Single option for multiple choice questions"""
    letter: str = Field(..., description="Option letter (A, B, C, D)")
    text: str = Field(..., description="Option text")

class GeneratedQuestion(BaseModel):
    """Individual question with structured format"""
    question: str = Field(..., description="Question text")
    options: List[QuestionOption] = Field(..., description="Multiple choice options")
    correct_answer: str = Field(..., description="Correct option letter")
    explanation: str = Field(..., description="Explanation why this answer is correct")
    topic: str = Field(..., description="Specific subtopic this question covers")
    keywords: List[str] = Field(..., description="Key concepts tested")

class QuestionGenerationResponse(BaseModel):
    """Complete response for question generation"""
    subject: str = Field(..., description="Main subject")
    topic: str = Field(..., description="Topic requested")
    difficulty: str = Field(..., description="Difficulty level")
    questions: List[GeneratedQuestion] = Field(..., description="Generated questions")

class LangChainIntegration:
    def __init__(self):
        self.llm = None
        self.memory = ConversationBufferMemory(memory_key="chat_history")
        self._initialize_llm()
    
    def _initialize_llm(self):
        """Initialize the LLM with Gemini API"""
        if settings.GEMINI_API_KEY:
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.0
            )
        else:
            raise ValueError("GEMINI_API_KEY is not set in environment variables")
    
    def generate_questions_prompt(self, subject: str, topic: str, difficulty: str, count: int) -> str:
        """Soru oluşturma için prompt oluşturur"""
        template = """
        Sen bir {subject} uzmanısın. {topic} konusunda {count} adet {difficulty} seviye soru oluştur.
        Sorular temel kavramları test etmeli ve konunun farklı yönlerini kapsamalı.
        
        Her soruyu aşağıdaki formatta oluştur:
        SORU: [Soru metni]
        SEÇENEKLER: 
        A) [İlk seçenek]
        B) [İkinci seçenek]
        C) [Üçüncü seçenek]
        D) [Dördüncü seçenek]
        CEVAP: [Doğru cevap harfi, örneğin A)
        AÇIKLAMA: [Doğru cevabın neden doğru olduğunu açıklayan kısa açıklama]
        KONU: [Bu sorunun kapsadığı özel alt konu]
        ANAHTAR KELİMELER: [Virgülle ayrılmış, test edilen temel kavramlar]
        
        Önemli format kuralları:
        - Her soru açıkça ayrılmalı
        - Her seçenek kendi satırında olmalı
        - Her seçenek büyük harfle başlamalı ve ardından parantez ve boşluk gelmeli
        - Birden fazla seçeneği aynı satıra koyma
        - Tüm gerekli alanları ekleyin
        - Soruları numaralandır (örneğin, Soru 1:, Soru 2: vb.)
        
        Soruların açık, net ve öğretici olmasına dikkat et. Her soru {topic} konusunun farklı bir yönünü test etmeli.
        """
        
        prompt = PromptTemplate(
            input_variables=["subject", "topic", "difficulty", "count"],
            template=template
        )
        
        return prompt.format(subject=subject, topic=topic, difficulty=difficulty, count=count)
    
    async def generate_questions(self, subject: str, topic: str, difficulty: str, count: int = 5, education_level: str = "high") -> QuestionGenerationResponse:
        """Generate multiple questions using LangChain with structured output"""
        if not self.llm:
            raise ValueError("LLM is not initialized")
        
        # Create Pydantic output parser for structured response
        parser = PydanticOutputParser(pydantic_object=QuestionGenerationResponse)
        format_instructions = parser.get_format_instructions()
        
        # Escape curly braces in format_instructions to prevent ChatPromptTemplate from treating them as variables
        escaped_format_instructions = format_instructions.replace("{", "{{").replace("}", "}}")
        
        # Define education level descriptions and requirements
        education_levels = {
            "ilkokul": {
                "description": "ilkokul (7-11 yaş)",
                "requirements": """
İlkokul öğrencileri için (7-11 yaş):
1. Sadece bilgiyi değil, düşünmeyi gerektiren sorular oluştur
2. Soru metni yaş grubuna uygun olarak açık ve net olmalı
3. Tam olarak 4 çoktan seçmeli seçenek (A, B, C, D) olmalı
4. Açık seçik doğru bir cevap ve yanıltıcı ama yanlış olan diğer seçenekler olmalı
5. Doğru cevabın neden doğru olduğunu ve diğerlerinin neden yanlış olduğunu açıklayan detaylı açıklama
6. Sorunun kapsadığı özel alt konu
7. 3-5 adet test edilen temel kavram
8. Gereksinimler yaş grubuna göre özelleştirildi
9. Escaped format instructions used
10. JSON output required
"""
            },
            "ortaokul": {
                "description": "ortaokul (11-14 yaş)",
                "requirements": """
Ortaokul öğrencileri için (11-14 yaş):
1. Sadece bilgiyi değil, düşünmeyi gerektiren sorular oluştur
2. Soru metni yaş grubuna uygun olarak açık ve net olmalı
3. Tam olarak 4 çoktan seçmeli seçenek (A, B, C, D) olmalı
4. Açık seçik doğru bir cevap ve yanıltıcı ama yanlış olan diğer seçenekler olmalı
5. Doğru cevabın neden doğru olduğunu ve diğerlerinin neden yanlış olduğunu açıklayan detaylı açıklama
6. Sorunun kapsadığı özel alt konu
7. 3-5 adet test edilen temel kavram
8. Gereksinimler yaş grubuna göre özelleştirildi
9. Escaped format instructions used
10. JSON output required
"""
            },
            "lise": {
                "description": "lise (14-18 yaş)",
                "requirements": """
Lise öğrencileri için (14-18 yaş):
1. Sadece bilgiyi değil, analiz gerektiren sorular oluştur
2. Soru metni yaş grubuna uygun olarak açık ve net olmalı
3. Tam olarak 4 çoktan seçmeli seçenek (A, B, C, D) olmalı
4. Açık seçik doğru bir cevap ve yanıltıcı ama yanlış olan diğer seçenekler olmalı
5. Doğru cevabın neden doğru olduğunu ve diğerlerinin neden yanlış olduğunu açıklayan detaylı açıklama
6. Sorunun kapsadığı özel alt konu
7. 3-5 adet test edilen kavram
8. Gereksinimler yaş grubuna göre özelleştirildi
9. Escaped format instructions used
10. JSON output required
"""
            }
        }
        
        education_info = education_levels.get(education_level, education_levels["lise"])
        education_description = education_info["description"]
        education_requirements = education_info["requirements"]
        
        # Create the prompt manually to avoid template variable conflicts with format_instructions
        system_message = f"Sen bir {subject} uzmanısın ve {education_description} seviyesinde sorular oluşturuyorsun."
        
        # Build human message without using f-string to avoid conflicts with format_instructions
        human_message = (
            f"{subject} alanında {topic} konusunda {count} adet {difficulty} zorlukta soru oluştur.\n\n"
            "Her soru için gereksinimler:\n"
            "1. Sadece bilgiyi değil, düşünmeyi gerektiren sorular oluştur\n"
            "2. Soru metni eğitim seviyesine uygun olarak açık ve net olmalı\n"
            "3. Tam olarak 4 çoktan seçmeli seçenek (A, B, C, D) olmalı\n"
            "4. Açık seçik doğru bir cevap ve yanıltıcı ama yanlış olan diğer seçenekler olmalı\n"
            "5. Doğru cevabın neden doğru olduğunu ve diğerlerinin neden yanlış olduğunu açıklayan detaylı açıklama\n"
            "6. Sorunun kapsadığı özel alt konu\n"
            "7. 3-5 adet test edilen temel kavram\n"
            f"{education_requirements}\n\n"
            f"{escaped_format_instructions}\n\n"
            f"Sadece JSON nesnesiyle yanıt ver. Başka metin, markdown veya açıklama eklememe. Tüm soruların {education_description} öğrencileri için uygun zorlukta olduğundan emin ol."
        )

        # Create messages manually to avoid template variable issues
        messages = [
            ("system", system_message),
            ("human", human_message)
        ]
        
        prompt_template = ChatPromptTemplate.from_messages(messages)
        
        # Create chain with parser
        chain = prompt_template | self.llm | parser
        
        try:
            # Generate structured response - no input variables needed since they're embedded in the prompt
            result = await chain.ainvoke({})
            return result
        except Exception as e:
            # Handle parsing errors with fallback mechanism
            print(f"Parser error, using fallback: {e}")
            return self._create_fallback_questions(subject, topic, difficulty, count)
    
    def _create_fallback_questions(self, subject: str, topic: str, difficulty: str, count: int) -> QuestionGenerationResponse:
        """Create fallback questions when parsing fails"""
        questions = []
        for i in range(count):
            questions.append(GeneratedQuestion(
                question=f"Bu bir örnek sorudur. Lütfen API'yi tekrar deneyin. (Soru {i+1})",
                options=[
                    QuestionOption(letter="A", text="Seçenek A"),
                    QuestionOption(letter="B", text="Seçenek B"),
                    QuestionOption(letter="C", text="Seçenek C"),
                    QuestionOption(letter="D", text="Seçenek D")
                ],
                correct_answer="A",
                explanation="Bu bir fallback açıklamasıdır.",
                topic=topic,
                keywords=["örnek", "fallback"]
            ))
        
        return QuestionGenerationResponse(
            subject=subject,
            topic=topic,
            difficulty=difficulty,
            questions=questions
        )
    
    def _parse_question_response(self, response: str) -> dict:
        """Parse the LLM response into structured data"""
        lines = response.strip().split('\n')
        result = {}
        
        current_key = None
        current_value = []
        
        for line in lines:
            if line.startswith("QUESTION:"):
                if current_key:
                    result[current_key] = '\n'.join(current_value).strip()
                current_key = "question"
                current_value = [line.replace("QUESTION:", "").strip()]
            elif line.startswith("OPTIONS:"):
                if current_key:
                    # Parse and format options
                    options_text = '\n'.join(current_value).strip()
                    result[current_key] = self._parse_options(options_text)
                current_key = "options"
                current_value = [line.replace("OPTIONS:", "").strip()]
            elif line.startswith("ANSWER:"):
                if current_key:
                    result[current_key] = '\n'.join(current_value).strip()
                current_key = "answer"
                current_value = [line.replace("ANSWER:", "").strip()]
            elif line.startswith("EXPLANATION:"):
                if current_key:
                    result[current_key] = '\n'.join(current_value).strip()
                current_key = "explanation"
                current_value = [line.replace("EXPLANATION:", "").strip()]
            else:
                if current_key:
                    current_value.append(line)
        
        # Add the last section
        if current_key:
            result[current_key] = '\n'.join(current_value).strip()
        
        return result
    
    def _parse_options(self, options_text: str) -> str:
        """Parse and format options to ensure each option is on a separate line"""
        if not options_text:
            return ""
        
        # Split by comma and reconstruct properly formatted options
        if ", " in options_text and "\n" not in options_text:
            # Options are on the same line, separated by commas
            options = options_text.split(", ")
            formatted_options = []
            for i, option in enumerate(options):
                # Extract letter and text
                letter = chr(65 + i)  # A, B, C, D
                if option.startswith(f"{letter}) "):
                    formatted_options.append(option)
                elif option.startswith(f"{letter.lower()}) "):
                    # Convert lowercase to uppercase
                    text = option[3:].strip()
                    formatted_options.append(f"{letter}) {text}")
                else:
                    # Handle cases where letter is missing
                    text = option.strip()
                    formatted_options.append(f"{letter}) {text}")
            return "\n".join(formatted_options)
        else:
            # Options are already properly formatted
            return options_text.strip()
    
    def evaluate_answer(self, question: str, correct_answer: str, user_answer: str) -> dict:
        """Evaluate user's answer by direct comparison"""
        # Normalize the answers for comparison
        normalized_correct = correct_answer.strip().upper()
        normalized_user = user_answer.strip().upper()
        
        # Handle different formats of user answers
        # Extract letter from options like "A) Option text" or "A)Option text"
        if ") " in normalized_user:
            normalized_user = normalized_user.split(") ")[0]
        elif ")" in normalized_user:
            normalized_user = normalized_user.split(")")[0]
        
        # Extract just the letter if user provided full option text
        # Check if user answer contains one of the option letters
        option_letters = ["A", "B", "C", "D"]
        if normalized_user not in option_letters:
            # Try to find option letter in the user's answer
            for letter in option_letters:
                if letter in normalized_user:
                    normalized_user = letter
                    break
        
        # Determine if the answer is correct
        is_correct = normalized_user == normalized_correct
        
        # Generate feedback
        if is_correct:
            feedback = "Correct! Well done."
        else:
            feedback = f"Incorrect. The correct answer is {correct_answer}. {self._get_incorrect_feedback(question, correct_answer)}"
        
        return {
            "is_correct": is_correct,
            "feedback": feedback
        }
    
    def _get_incorrect_feedback(self, question: str, correct_answer: str) -> str:
        """Generate feedback for incorrect answers"""
        # Simple feedback for now, could be enhanced with LLM in the future
        return "Please review the concepts related to this question and try again."
    
    def _parse_evaluation_response(self, response: str) -> dict:
        """Parse the evaluation response"""
        lines = response.strip().split('\n')
        result = {}
        
        for line in lines:
            if line.startswith("IS_CORRECT:"):
                result["is_correct"] = line.replace("IS_CORRECT:", "").strip().lower() == "yes"
            elif line.startswith("FEEDBACK:"):
                result["feedback"] = line.replace("FEEDBACK:", "").strip()
        
        return result
    
    def analyze_performance(self, subject: str, topic: str, correct_answers: int, total_questions: int) -> dict:
        """Analyze user performance and identify weaknesses"""
        if not self.llm:
            raise ValueError("LLM is not initialized")
        
        accuracy = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
        
        template = """
        Subject: {subject}
        Topic: {topic}
        Accuracy: {accuracy}%
        Correct Answers: {correct_answers}
        Total Questions: {total_questions}
        
        Based on this performance data:
        1. Identify the weakness level (0-10 scale, where 10 is severe weakness)
        2. Provide a brief analysis of the performance
        3. Suggest specific areas for improvement
        
        Format your response as:
        WEAKNESS_LEVEL: [0-10]
        ANALYSIS: [Brief analysis]
        IMPROVEMENT_AREAS: [Comma-separated areas for improvement]
        """
        
        prompt = PromptTemplate(
            input_variables=["subject", "topic", "accuracy", "correct_answers", "total_questions"],
            template=template
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        response = chain.run(
            subject=subject,
            topic=topic,
            accuracy=accuracy,
            correct_answers=correct_answers,
            total_questions=total_questions
        )
        
        # Parse the response
        return self._parse_performance_response(response)
    
    def _parse_performance_response(self, response: str) -> dict:
        """Parse the performance analysis response"""
        lines = response.strip().split('\n')
        result = {}
        
        for line in lines:
            if line.startswith("WEAKNESS_LEVEL:"):
                try:
                    result["weakness_level"] = int(line.replace("WEAKNESS_LEVEL:", "").strip())
                except ValueError:
                    result["weakness_level"] = 5
            elif line.startswith("ANALYSIS:"):
                result["analysis"] = line.replace("ANALYSIS:", "").strip()
            elif line.startswith("IMPROVEMENT_AREAS:"):
                result["improvement_areas"] = line.replace("IMPROVEMENT_AREAS:", "").strip().split(",")
        
        return result

# Global instance
langchain_integration = LangChainIntegration()
