import customtkinter as ctk
import threading
from voice_engine import VoiceEngine
from command_handler import CommandHandler

class ToniGUI(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("Toni AI Assistant")
        self.geometry("600x500")
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")

        # Initialize Logic
        self.voice = VoiceEngine()
        self.handler = CommandHandler(self.voice)
        self.is_listening = False
        self.wake_word = "hey toni"

        # UI Components
        self.setup_ui()

    def setup_ui(self):
        # Header
        self.label = ctk.CTkLabel(self, text="TONI AI", font=("Orbitron", 24, "bold"))
        self.label.pack(pady=20)

        # Status Indicator
        self.status_label = ctk.CTkLabel(self, text="Status: Idle", text_color="gray")
        self.status_label.pack()

        # Chat History / Display
        self.chat_display = ctk.CTkTextbox(self, width=500, height=250)
        self.chat_display.pack(pady=10)
        self.chat_display.insert("0.0", "Welcome Sir. Say 'Hey Toni' to activate.\n")

        # Manual Input
        self.input_frame = ctk.CTkFrame(self)
        self.input_frame.pack(pady=10, fill="x", padx=50)

        self.entry = ctk.CTkEntry(self.input_frame, placeholder_text="Type command here...", width=300)
        self.entry.pack(side="left", padx=10, pady=10, expand=True, fill="x")
        self.entry.bind("<Return>", lambda e: self.process_manual_command())

        self.send_btn = ctk.CTkButton(self.input_frame, text="Send", width=80, command=self.process_manual_command)
        self.send_btn.pack(side="right", padx=10)

        # Control Button
        self.listen_btn = ctk.CTkButton(self, text="Start Listening", command=self.toggle_listening, fg_color="green")
        self.listen_btn.pack(pady=20)

    def log(self, message):
        self.chat_display.insert("end", f"{message}\n")
        self.chat_display.see("end")

    def update_status(self, status, color="gray"):
        self.status_label.configure(text=f"Status: {status}", text_color=color)

    def toggle_listening(self):
        if not self.is_listening:
            self.is_listening = True
            self.listen_btn.configure(text="Stop Listening", fg_color="red")
            threading.Thread(target=self.background_listen, daemon=True).start()
        else:
            self.is_listening = False
            self.listen_btn.configure(text="Start Listening", fg_color="green")
            self.update_status("Idle")

    def background_listen(self):
        self.update_status("Waiting for Wake Word...", "yellow")
        while self.is_listening:
            query = self.voice.listen()
            if self.wake_word in query:
                self.update_status("Listening...", "green")
                self.voice.speak("Yes Sir?")
                
                # Listen for actual command
                command = self.voice.listen()
                if command != "none":
                    self.log(f"You: {command}")
                    self.update_status("Processing...", "cyan")
                    should_continue = self.handler.execute(command)
                    if not should_continue:
                        self.is_listening = False
                        self.after(0, self.toggle_listening)
                        break
                
                self.update_status("Waiting for Wake Word...", "yellow")

    def process_manual_command(self):
        cmd = self.entry.get()
        if cmd:
            self.log(f"You (Type): {cmd}")
            self.entry.delete(0, "end")
            threading.Thread(target=self.handler.execute, args=(cmd.lower(),), daemon=True).start()

if __name__ == "__main__":
    app = ToniGUI()
    app.mainloop()
