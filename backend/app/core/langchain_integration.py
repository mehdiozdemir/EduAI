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
                temperature=0.7
            )
        else:
            raise ValueError("GEMINI_API_KEY is not set in environment variables")
    
    def generate_questions_prompt(self, subject: str, topic: str, difficulty: str, count: int) -> str:
        """Generate a prompt for question creation with count parameter"""
        template = """
        You are an expert {subject} tutor. Create {count} {difficulty} level questions about {topic}.
        The questions should test understanding of key concepts and cover different aspects of the topic.
        
        Format the response as follows for each question:
        QUESTION: [The question text]
        OPTIONS: 
        A) [First option]
        B) [Second option]
        C) [Third option]
        D) [Fourth option]
        ANSWER: [The correct answer letter, e.g., A)
        EXPLANATION: [Brief explanation of why this is the correct answer]
        TOPIC: [Specific subtopic this question covers]
        KEYWORDS: [Comma-separated key concepts tested]
        
        Important formatting rules:
        - Each question must be clearly separated
        - Each option must be on a separate line
        - Each option must start with a capital letter followed by a closing parenthesis and a space
        - Do not put multiple options on the same line
        - Include all required fields for each question
        - Number each question clearly (e.g., Question 1:, Question 2:, etc.)
        
        Make sure the questions are clear, concise, and educational. Each question should test a different aspect of {topic}.
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
        
        # Define education level descriptions and requirements
        education_levels = {
            "middle": {
                "description": "middle school (ages 11-14)",
                "requirements": """
For middle school students (ages 11-14):
1. Focus on foundational concepts with practical applications
2. Include word problems that connect to real-life situations
3. Questions should require basic problem-solving skills
4. Use clear, age-appropriate language
5. Include visual or concrete examples when possible
6. Avoid overly abstract or theoretical concepts
7. Distractors should be plausible but clearly wrong to students who understand the concept
8. Explanations should be simple and direct
"""
            },
            "high": {
                "description": "high school (ages 14-18)",
                "requirements": """
For high school students (ages 14-18):
1. Include multi-step problem-solving that requires analysis
2. Emphasize critical thinking and application of concepts
3. Integrate multiple concepts within a single question
4. Include questions that require interpretation of data or graphs
5. Use more sophisticated vocabulary and complex sentence structures
6. Distractors should be challenging and require careful consideration
7. Explanations should include reasoning and connections between concepts
8. Include questions that require students to identify patterns or make predictions
"""
            },
            "university": {
                "description": "university level (ages 18+)",
                "requirements": """
For university students (ages 18+):
1. Emphasize critical thinking, synthesis, and evaluation of complex concepts
2. Include questions that require application of theories to novel situations
3. Integrate advanced interdisciplinary connections
4. Include questions that require analysis of research findings or case studies
5. Use sophisticated academic language and terminology
6. Distractors should be highly plausible and require deep understanding to eliminate
7. Explanations should include theoretical foundations and real-world implications
8. Include questions that require students to critique methodologies or propose solutions
9. Focus on higher-order thinking skills: analysis, synthesis, and evaluation
10. Include questions that require interpretation of complex data or mathematical models
"""
            }
        }
        
        education_info = education_levels.get(education_level, education_levels["high"])
        education_description = education_info["description"]
        education_requirements = education_info["requirements"]
        
        # Create the prompt manually to avoid template variable conflicts with format_instructions
        system_message = f"You are an expert {subject} tutor creating {education_description} level questions."
        
        human_message = f"""Create {count} {difficulty} level questions about {topic} in {subject} for {education_description} students.

Requirements for each question:
1. Create thought-provoking questions that require critical thinking, not simple recall
2. Clear, concise question text appropriate for the education level
3. Exactly 4 multiple choice options (A, B, C, D)
4. One clearly correct answer with distractors that are plausible but incorrect
5. Detailed explanation of why the correct answer is right and why others are wrong
6. Specific subtopic this question covers
7. 3-5 key concepts tested
{education_requirements}

{format_instructions}

Respond with ONLY the JSON object. No other text, no markdown, no explanations. Ensure all questions are appropriately challenging for {education_description} students."""

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
