from app.hardware.card_reader import NFCReader

def read_card_uid() -> str:
    reader = NFCReader()
    return reader.read()