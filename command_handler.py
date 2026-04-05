import os
import webbrowser
import datetime
import wikipedia
import pyautogui
import requests
import subprocess

class CommandHandler:
    def __init__(self, voice_engine):
        self.voice = voice_engine
        self.n8n_webhook_url = "YOUR_N8N_WEBHOOK_URL_HERE"

    def execute(self, query):
        if 'wikipedia' in query:
            self.voice.speak('Searching Wikipedia...')
            query = query.replace("wikipedia", "")
            results = wikipedia.summary(query, sentences=2)
            self.voice.speak("According to Wikipedia")
            self.voice.speak(results)

        elif 'open youtube' in query:
            webbrowser.open("youtube.com")
            self.voice.speak("Opening YouTube")

        elif 'open google' in query:
            webbrowser.open("google.com")
            self.voice.speak("Opening Google")

        elif 'the time' in query:
            strTime = datetime.datetime.now().strftime("%H:%M:%S")
            self.voice.speak(f"Sir, the time is {strTime}")

        elif 'open notepad' in query:
            os.system("notepad.exe")
            self.voice.speak("Opening Notepad")

        elif 'open code' in query:
            # Adjust path if VS Code is installed elsewhere
            os.system("code") 
            self.voice.speak("Opening Visual Studio Code")

        elif 'search' in query:
            search_query = query.replace("search", "")
            webbrowser.open(f"https://www.google.com/search?q={search_query}")
            self.voice.speak(f"Searching Google for {search_query}")

        elif 'automation' in query or 'turn on' in query or 'trigger' in query:
            self.trigger_n8n(query)

        elif 'exit' in query or 'stop' in query:
            self.voice.speak("Goodbye Sir!")
            return False

        else:
            # Basic offline fallback / Rule-based NLP
            if "hello" in query or "hi" in query:
                self.voice.speak("Hello! I am Toni. How can I help you today?")
            else:
                self.voice.speak("I'm not sure how to do that yet, but I'm learning!")
        
        return True

    def trigger_n8n(self, command):
        """Send a command to n8n webhook."""
        try:
            payload = {"command": command, "timestamp": str(datetime.datetime.now())}
            response = requests.post(self.n8n_webhook_url, json=payload)
            if response.status_code == 200:
                self.voice.speak("Automation triggered successfully.")
            else:
                self.voice.speak("Failed to trigger automation.")
        except Exception as e:
            self.voice.speak("Could not connect to automation server.")
            print(f"n8n Error: {e}")
