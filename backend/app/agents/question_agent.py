
from __future__ import annotations

import asyncio
import math

from typing import Any, Dict, List

from app.agents.base_agent import BaseAgent

# LangChain / Pydantic utilities
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# QUESTION AGENT
# ---------------------------------------------------------------------------


class QuestionAgent(BaseAgent):
    """Agent dedicated to **question generation** and **answer evaluation**.

    Public API mirrors the old behaviour so existing integrations continue to
    work, but the internals are now organised for readability and testability
    (Single-responsibility, small private helpers, explicit error handling).
    """

    # -------------------------- INITIALISATION --------------------------- #

    def __init__(self) -> None:
        super().__init__(
            name="Question Agent",
            description="Generates multiple-choice questions and grades answers"
        )

    # ----------------------------- PUBLIC API --------------------------- #

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Entry-point expected by :class:`MasterAgent`.

        Parameters
        ----------
        input_data : Dict[str, Any]
            Expected keys:
            - subject (str)
            - topic (str)
            - difficulty (str, optional)
            - count (int, optional)
            - education_level (str, optional)
        """

        try:
            request_params = self._validate_request(input_data)
            questions = await self._generate_questions(**request_params)
            return self._success_response(questions.model_dump() if hasattr(questions, "model_dump") else questions)
        except Exception as exc:  # noqa: BLE001 – surface the error but keep response shape consistent
            return self._error_response(str(exc))

    async def evaluate_answer(
        self,
        question: str,
        correct_answer: str,
        user_answer: str,
    ) -> Dict[str, Any]:
        """Grade a single answer provided by the learner."""

        try:
            evaluation = self._evaluate_answer_internal(
                question=question,
                correct_answer=correct_answer,
                user_answer=user_answer,
            )
            return self._success_response(evaluation)
        except Exception as exc:  # noqa: BLE001
            return self._error_response(str(exc))

    # --------------------------- PRIVATE HELPERS ------------------------ #

    @staticmethod
    def _validate_request(data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and normalise incoming request parameters."""

        required_fields = ("subject", "topic")
        missing = [field for field in required_fields if not data.get(field)]
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")

        return {
            "subject": data["subject"],
            "topic": data["topic"],
            "difficulty": data.get("difficulty", "medium"),
            "count": int(data.get("count", 5)),
            "education_level": data.get("education_level", "lise"),
        }

    # --------------------------- UTILITY METHODS -------------------------- #

    def _evaluate_answer_internal(
        self,
        question: str,
        correct_answer: str,
        user_answer: str,
    ) -> Dict[str, Any]:
        """Simple rule-based evaluation to avoid an extra LLM round-trip."""

        normalized_correct = correct_answer.strip().upper()
        normalized_user = user_answer.strip().upper()

        # Accept answers like "A) Option" or "A)Option"
        if ") " in normalized_user:
            normalized_user = normalized_user.split(") ")[0]
        elif ")" in normalized_user:
            normalized_user = normalized_user.split(")")[0]

        # Try to extract letter from full text
        for letter in ("A", "B", "C", "D"):
            if normalized_user == letter or letter + ")" in normalized_user:
                normalized_user = letter
                break

        is_correct = normalized_user == normalized_correct

        feedback = (
            "Correct! Well done." if is_correct else f"Incorrect. The correct answer is {correct_answer}."
        )

        return {"is_correct": is_correct, "feedback": feedback}

    def _fallback_questions(
        self,
        subject: str,
        topic: str,
        difficulty: str,
        count: int,
    ) -> 'QuestionGenerationResponse':
        """Return a minimal placeholder response when parsing fails."""

        dummy_questions = []
        for i in range(count):
            dummy_questions.append(
                GeneratedQuestion(
                    question=f"Bu bir örnek sorudur. (Soru {i + 1})",
                    options=[
                        QuestionOption(letter="A", text="Seçenek A"),
                        QuestionOption(letter="B", text="Seçenek B"),
                        QuestionOption(letter="C", text="Seçenek C"),
                        QuestionOption(letter="D", text="Seçenek D"),
                    ],
                    correct_answer="A",
                    explanation="Bu bir fallback açıklamasıdır.",
                    topic=topic,
                    keywords=["örnek", "fallback"],
                )
            )

        return QuestionGenerationResponse(
            subject=subject,
            topic=topic,
            difficulty=difficulty,
            questions=dummy_questions,
        )

    async def _generate_questions(
        self,
        subject: str,
        topic: str,
        difficulty: str,
        count: int,
        education_level: str,
        _exclude: List[str] | None = None,
    ) -> 'QuestionGenerationResponse':  # forward reference for type hint
        """Generate question set via the underlying LLM and return parsed model.

        Large *count* values are split into batches of size 10 to lower the
        probability of formatting errors that cause the JSON parser to fail.
        """

        batch_size = 10
        if count > batch_size:
            # Determine number of batches and distribute counts
            num_batches = math.ceil(count / batch_size)
            per_batch_counts = [batch_size] * num_batches
            per_batch_counts[-1] = count - batch_size * (num_batches - 1) or batch_size

            # Launch batch requests concurrently for speed
            tasks = [
                self._generate_questions_single(
                    subject=subject,
                    topic=topic,
                    difficulty=difficulty,
                    count=batch_count,
                    education_level=education_level,
                    _exclude=_exclude or [],
                )
                for batch_count in per_batch_counts
            ]

            batch_results: List[QuestionGenerationResponse] = await asyncio.gather(*tasks, return_exceptions=False)

            # Flatten and deduplicate questions
            seen: set[str] = set(_exclude or [])
            merged_questions: List[GeneratedQuestion] = []
            for batch in batch_results:
                for q in batch.questions:
                    if q.question not in seen:
                        merged_questions.append(q)
                        seen.add(q.question)
                    if len(merged_questions) == count:
                        break
                if len(merged_questions) == count:
                    break

            # If duplicates caused shortage, generate extra sequentially
            shortage = count - len(merged_questions)
            while shortage > 0:
                refill_resp = await self._generate_questions_single(
                    subject=subject,
                    topic=topic,
                    difficulty=difficulty,
                    count=shortage,
                    education_level=education_level,
                    _exclude=list(seen),
                )
                for q in refill_resp.questions:
                    if q.question not in seen:
                        merged_questions.append(q)
                        seen.add(q.question)
                        shortage -= 1
                        if shortage == 0:
                            break

            return QuestionGenerationResponse(
                subject=subject,
                topic=topic,
                difficulty=difficulty,
                questions=merged_questions,
            )

        # --- single batch path -------------------------------------------------
        return await self._generate_questions_single(
            subject=subject,
            topic=topic,
            difficulty=difficulty,
            count=count,
            education_level=education_level,
            _exclude=_exclude or [],
        )

    async def _generate_questions_single(
        self,
        subject: str,
        topic: str,
        difficulty: str,
        count: int,
        education_level: str,
        _exclude: List[str],
    ) -> 'QuestionGenerationResponse':
        """Generate up to batch_size questions in a single LLM call."""

        parser = PydanticOutputParser(pydantic_object=QuestionGenerationResponse)
        format_instructions = parser.get_format_instructions().replace("{", "{{").replace("}", "}}")

        education_levels = {
            "ilkokul": "ilkokul (7-11 yaş)",
            "ortaokul": "ortaokul (11-14 yaş)",
            "lise": "lise (14-18 yaş)",
        }

        education_desc = education_levels.get(education_level, education_levels["lise"])

        system_msg = (
            f"Sen bir {subject} uzmanısın ve {education_desc} seviyesinde sorular oluşturuyorsun."
        )

        # Build exclusion disclaimer to avoid duplicates
        exclusion_block = ""
        if _exclude:
            exclusion_block = (
                "Aşağıdaki sorulara benzer veya aynı sorular oluşturma:\n" +
                "\n".join([f"- {q}" for q in _exclude[-20:]]) + "\n\n"
            )

        human_msg = (
            f"{subject} alanında {topic} konusunda {count} adet {difficulty} zorlukta soru oluştur.\n\n"
            "Her soru için gereksinimler:\n"
            "1. Sadece bilgiyi değil, düşünmeyi gerektiren sorular oluştur\n"
            "2. Tam olarak 4 çoktan seçmeli seçenek (A, B, C, D) olmalı\n"
            "3. Doğru cevabı açıkça belirt ve diğerlerini yanıltıcı yap\n"
            "4. Doğru cevabın neden doğru olduğunu açıklayan bölüm ekle\n"
            "5. Her soru için alt konu ve anahtar kelimeler belirt\n\n"
            f"{exclusion_block}"
            f"{format_instructions}\n\n"
            "Sadece JSON formatında cevap ver."
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_msg),
            ("human", human_msg),
        ])

        # Temporarily raise temperature to diversify batches
        original_temp = self.temperature
        self.temperature = 0.3

        chain = prompt | self.llm | parser

        try:
            result = await chain.ainvoke({})
            self.temperature = original_temp
            return result
        except Exception:
            self.temperature = original_temp
            return self._fallback_questions(subject, topic, difficulty, count)

    # ------------------------ RESPONSE HELPERS ------------------------- #

    def _success_response(self, payload: Any) -> Dict[str, Any]:
        return {"status": "success", "agent": str(self.name), "data": payload}

    def _error_response(self, message: str) -> Dict[str, Any]:
        return {"status": "error", "agent": str(self.name), "error": message}


# Defined *outside* the class to avoid Pydantic issues with inner classes


class QuestionOption(BaseModel):
    letter: str = Field(..., description="Option letter (A, B, C, D)")
    text: str = Field(..., description="Option text")


class GeneratedQuestion(BaseModel):
    question: str
    options: List[QuestionOption]
    correct_answer: str
    explanation: str
    topic: str
    keywords: List[str]


class QuestionGenerationResponse(BaseModel):
    subject: str
    topic: str
    difficulty: str
    questions: List[GeneratedQuestion]

    # Allow model -> dict conversion with aliases
    model_config = {"populate_by_name": True}

    def dict(self, *args, **kwargs):  # type: ignore[override]
        kwargs.setdefault("by_alias", True)
        return super().dict(*args, **kwargs)
