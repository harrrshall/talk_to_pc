import socket
import subprocess
import socket
import subprocess

class Command:
    def __init__(self):
        self.commands = {
            "terminal\n": self.command_terminal,
            "google\n": self.command_google,
            "youtube\n": self.command_youtube,
            "calculator\n": self.command_calculator,
            "suspend\n": self.command_suspend
        }

    def command_terminal(self):
        subprocess.run(['gnome-terminal'])

    def command_google(self):
        subprocess.run(['google-chrome'])

    def command_youtube(self):
        subprocess.run(['google-chrome', 'https://www.youtube.com'])

    def command_calculator(self):
        subprocess.run(['gnome-calculator'])

    def command_suspend(self):
        subprocess.run(['sudo', 'pm-suspend'])

class Server(Command):
    def __init__(self, ip_address, port_number):
        super().__init__()
        self.ip_address = ip_address
        self.port_number = port_number
        self.pending_num = 1
        self.data_buffer = ""
        self.server_listening_socket = None
        self.server_connection_socket = None

    def server_init(self):
        # Creating the server socket
        self.server_listening_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_listening_socket.bind((self.ip_address, self.port_number))
        self.server_listening_socket.listen()

        print(f"Server listening on {self.ip_address}:{self.port_number}")

        while True:
            self.server_connection_socket, _ = self.server_listening_socket.accept()
            print("Client connected")

            data = self.server_connection_socket.recv(1024).decode()
            self.data_buffer = data.lower()
            print("Message from client:", self.data_buffer)
            self.server_execute_command()

            self.server_connection_socket.close()
            print("Client disconnected")

    def server_send(self, message):
        self.server_connection_socket.sendall(message.encode())

    def server_execute_command(self):
        command = self.commands.get(self.data_buffer)
        if command:
            command()
        else:
            print('Invalid command received from client')

if __name__ == "__main__":
    my_server = Server("192.168.1.21", 8080)
    my_server.server_init()
