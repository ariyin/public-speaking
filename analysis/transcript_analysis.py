import re
import json
import time
from ollama import Client
from collections import Counter
from typing import List, Dict

FILLER_PROMPT_TEMPLATE = """
You are given a portion of a spoken transcript. Your task is to extract only the **filler words or phrases** used in context.

Filler words are typically unnecessary pauses, hedges, or verbal crutches. Common examples include: "um", "uh", "like", "you know", "I guess", "so", "basically", "I mean", "sort of", etc.

Output a JSON list in the following format:

[
  {{ "filler_phrases": ["um", "like", "sort of", "yeah"] }}
]

If no filler words are found, return an empty list:
[]

Return **only** the JSON—no explanations, no additional text.

Transcript:
{text}
"""

client = Client()

def detect_filler_words_with_gpt(result: dict) -> list:
    all_words = result.get("segments")

    # Join words to make a full transcript
    full_transcript = "".join(word["text"] for word in all_words)

    # Split the transcript into chunks based on sentence-terminating punctuation
    sentence_chunks = re.split(r'(?<=[.!?]) +', full_transcript)

    detected_fillers = []

    for i, chunk in enumerate(sentence_chunks):
        #print(f"RUN {i + 1}: ================")
        chunk = sentence_chunks[i]
        #print("INPUT: " + chunk)
        prompt = FILLER_PROMPT_TEMPLATE.format(text=chunk)

        # Send the chunk to Mistral for filler word detection
        response = client.chat(model="llama3", messages=[{"role": "user", "content": prompt}])

        #print("RAW: " + response.message.content)

        filler_word_dict = extract_first_bracketed_content(response.message.content)

        #print("FILTERED: " + filler_word_dict)

        try:
            chunk_result = json.loads(filler_word_dict)
        except Exception as e:
            print(f"Failed to parse JSON from LLM response: {e}")
            continue # retry


        # Map the detected filler words to the corresponding timestamps in the transcript
        for entry in chunk_result:
            detected_fillers.extend(entry["filler_phrases"])
    
    return detected_fillers



def summarize_filler_word_counts(filler_words: List[Dict]) -> Dict[str, int]:
    """
    Takes a list of detected filler words with timestamps and returns a dictionary
    counting how many times each filler word occurred.
    """
    return dict(Counter(word.lower() for word in filler_words))



def calculate_speech_rate(result: dict) -> float:
    segments = []
    word_count = 0
    for segment in result.get("segments", []):
        segments.append(segment)
        word_count += len(segment["text"].strip().split())

    if not segments:
        return 0.0

    start_time = segments[0]["start"]
    end_time = segments[-1]["end"]
    duration_sec = end_time - start_time

    if duration_sec <= 0:
        return 0.0

    words_per_minute = (word_count / duration_sec) * 60
    return round(words_per_minute, 2)



def analyze_transcript(result: dict):
    return {
        "speech_rate_wpm": calculate_speech_rate(result),
        "filler_words": summarize_filler_word_counts(detect_filler_words_with_gpt(result))
    }


# HELPERS

def extract_first_bracketed_content(s: str) -> str:
    start = s.find('[')
    if start == -1:
        return "[]"
    
    depth = 0
    for i in range(start, len(s)):
        if s[i] == '[':
            depth += 1
        elif s[i] == ']':
            depth -= 1
            if depth == 0:
                return s[start:i + 1]
    
    return "[]"