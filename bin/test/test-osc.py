import socket

port = 12000
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(("localhost", port))

print(f"Listening on localhost:{port}...")
while True:
    data, addr = sock.recvfrom(1024)
    # print(f"\rReceived from {addr}: {data}", end="", flush=True)
    ascii_repr = "".join(chr(b) if 32 <= b < 127 else "." for b in data)
    print(f"\n\r{len(data)} bytes | ASCII: {ascii_repr[:50]}", end="", flush=True)
