import pyttsx3
import speech_recognition as sr
import threading

class VoiceEngine:
    def __init__(self):
        # Initialize Text-to-Speech
        self.engine = pyttsx3.init('sapi5')
        voices = self.engine.getProperty('voices')
        # Set default voice (usually 0 is male, 1 is female)
        self.engine.setProperty('voice', voices[0].id)
        self.engine.setProperty('rate', 180) # Speed of speech

        # Initialize Speech Recognition
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 300
        self.recognizer.dynamic_energy_threshold = True

    def speak(self, text):
        """Convert text to speech."""
        print(f"Assistant: {text}")
        self.engine.say(text)
        self.engine.runAndWait()

    def listen(self):
        """Listen for audio input and return text."""
        with sr.Microphone() as source:
            print("Listening...")
            self.recognizer.pause_threshold = 1
            audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=8)

        try:
            print("Recognizing...")
            query = self.recognizer.recognize_google(audio, language='en-in')
            print(f"User said: {query}\n")
            return query.lower()
        except sr.UnknownValueError:
            return "None"
        except sr.RequestError:
            return "Network Error"
        except Exception as e:
            print(f"Error: {e}")
            return "None"
