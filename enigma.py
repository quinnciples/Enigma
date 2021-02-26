import logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s.%(msecs)03d - %(levelname)8s - %(filename)s - Function: %(funcName)20s - Line: %(lineno)4s // %(message)s',
                    datefmt='%Y-%m-%d %H:%M:%S',
                    handlers=[
                        # logging.FileHandler(filename='log.txt'),
                        logging.StreamHandler()
                    ])
# logging.disable(level=logging.CRITICAL)
logging.info('Loaded.')


class Enigma:
    """DOC STRING"""

    ROTOR_POOL = {
            'Master': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            'I':     ['EKMFLGDQVZNTOWYHXUSPAIBRCJ', 0],
            'II':    ['AJDKSIRUXBLHWTMCQGZNPYFVOE', 0],
            'III':   ['BDFHJLCPRTXVZNYEIWGAKMUSQO', 0],
            'IV':    ['ESOVPZJAYQUIRHXLNFTGKDCMWB', 0],
            'V':     ['VZBRGITYUPSDNHLXAWMJQOFECK', 0],
            'VI':    ['JPGVOUMFYQBENHZRDKASXLICTW', 0],
            'VII':   ['NZJHGRCXMYSWBOUFAIVLPEKQDT', 0],
            'VIII':  ['FKQHTLXOCBJSPDZRAMEWNIUYGV', 0],
            'Reflector A': 'EJMZALYXVBWFCRQUONTSPIKHGD',
            'Reflector B': 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
            'Reflector C': 'FVPJIAOYEDRZXWGCTKUQSBNMHL'
        }

    def __init__(self, rotors: list, reflector: str, initial_rotor_settings: list, plug_board_connections: list = None):
        # Reference https://en.wikipedia.org/wiki/Enigma_rotor_details
        
        self.initial_rotor_settings = initial_rotor_settings
        self.rotor_selection = rotors
        self.reflector_selection = reflector
        self.plugs = {}
        if plug_board_connections:
            for connection in plug_board_connections:
                char_in, char_out = connection
                self.add_plug_board_connection(key_in=char_in, key_out=char_out)
        self.resetMachine()

    def __str__(self):
        return str([rotor[0] for rotor in self.rotors])

    def resetMachine(self):
        self.rotors = [Enigma.ROTOR_POOL[self.rotor_selection[0]],
                       Enigma.ROTOR_POOL[self.rotor_selection[1]],
                       Enigma.ROTOR_POOL[self.rotor_selection[2]]]

        # self.advanceRotor(self.initial_rotor_settings[2])
        # self.advanceRotor(self.initial_rotor_settings[1] * 26)
        # self.advanceRotor(self.initial_rotor_settings[0] * 26 * 26)

        for spin, rotor in zip(self.initial_rotor_settings, range(3)):
            spin = spin % 26
            if spin > 0:
                self.rotors[rotor] = [self.rotors[rotor][0][spin:] + self.rotors[rotor][0][0:spin], spin]

        print(f'Key: {self.rotors[0][0][0]} {self.rotors[1][0][0]} {self.rotors[2][0][0]}')

        self.reflector = Enigma.ROTOR_POOL[self.reflector_selection]

    def add_plug_board_connection(self, key_in: str, key_out: str) -> None:
        logging.debug(f'Creating plug board connection between {key_in} and {key_out}.')
        self.plugs[key_in] = key_out
        self.plugs[key_out] = key_in

    def remove_plug_board_connection(self, key_in: str, key_out: str) -> None:
        if key_in not in self.plugs or self.plugs.get(key_in, None) != key_out or key_out not in self.plugs or self.plugs.get(key_out, None) != key_in:
            Exception(f'Connection between {key_in} and {key_out} does not exist on the plugboard.')
        else:
            logging.debug(f'Removing plug board connection between {key_in} and {key_out}.')
            if key_in in self.plugs:
                del self.plugs[key_in]
            if key_out in self.plugs:
                del self.plugs[key_out]

    def plugBoard(self, key_in):
        if key_in in self.plugs:
            logging.debug(f'Translating plug board connection between {key_in} and {self.plugs.get(key_in, key_in)}.')
        return self.plugs.get(key_in, key_in)

    def advanceRotor(self, iterations=1):

        for i in range(iterations):
            for r, rotor in reversed(list(enumerate(self.rotors))):
                logging.debug(f'Advancing rotor {r} from {rotor} to {[rotor[0][1:] + rotor[0][0], rotor[1] + 1]}')
                rotor_copy = [rotor[0][1:] + rotor[0][0], rotor[1] + 1]
                self.rotors[r] = rotor_copy
                if self.rotors[r][1] % 26 == 0:
                    self.rotors[r][1] = 0
                    logging.debug('Advancing next rotor')
                else:
                    break

    def encodeMessage(self, message):
        message = message.upper()
        message = message.replace(' ', 'X')
        result = ''

        for c in message:
            self.advanceRotor()

            # Run in through plug board
            encoded_value = self.plugBoard(c)

            # Go from right to left

            for rotor in reversed(self.rotors):
                encoded_value = rotor[0][Enigma.ROTOR_POOL['Master'].find(encoded_value)]

            # Handle reflector
            encoded_value = self.reflector[Enigma.ROTOR_POOL['Master'].find(encoded_value)]

            # Go from left to right
            for rotor in self.rotors:
                encoded_value = Enigma.ROTOR_POOL['Master'][rotor[0].find(encoded_value)]

            # Run out through plugboard
            encoded_value = self.plugBoard(encoded_value)

            result += encoded_value

        return result


if __name__ == '__main__':
    # E = Enigma(rotors=['IV', 'VI', 'III'], initial_rotor_settings=[9, 6, 16], plug_board_connections=[('G', 'U'), ('D', 'E'), ('N', 'T'), ('A', 'V'), ('P', 'L'), ('Q', 'S'), ('K', 'J'), ('O', 'R'), ('W', 'M'), ('X', 'Z')])
    # print('-=' * 40)
    # print(E)
    # print('-=' * 40)
    # original_message = """Pack my box with five dozen liquor jugs Weather report things look slightly cloudy over here Hopefully the weather improves tomorrow"""
    # encoded = E.encodeMessage(original_message)
    # print('Message in:', original_message, 'Message out:', encoded)
    # E.resetMachine()
    # message = encoded
    # encoded = E.encodeMessage(encoded)
    # print('Message in:', message, 'Message out:', encoded, encoded == original_message.strip().upper().replace(' ', 'X'))
    # print('-=' * 40)
    # print(E)
    # print('-=' * 40)
    # original_message = 'GCDSE AHUGW TQGRK VLFGX UCALX VYMIG MMNMF DXTGN VHVRM MEVOU YFZSL RHDRR XFJWC FHUHM UNZEF RDISI KBGPM YVXUZ'.replace(' ', '')
    # E = None
    # print(f'Encoded:  {original_message}')
    # enigma = Enigma(rotors=['II', 'I', 'III'], initial_rotor_settings=[24, 13, 22], plug_board_connections=[('A', 'M'), ('F', 'I'), ('N', 'V'), ('P', 'S'), ('T', 'U'), ('W', 'Z')])
    # decoded = enigma.encodeMessage(original_message)
    # print(f'Decoded:  {decoded}')
    # print('Expected:', 'FEIND LIQEI NFANT ERIEK OLONN EBEOB AQTET XANFA NGSUE DAUSG ANGBA ERWAL DEXEN DEDRE IKMOS TWAER TSNEU STADT'.replace(' ', ''))
    enigma = Enigma(rotors = ['I', 'II', 'III'], reflector='Reflector B', initial_rotor_settings=[20, 9, 6], plug_board_connections=None)
    original_message = 'AAAAAAAAAA'
    decoded = enigma.encodeMessage(message=original_message)
    expected = 'CXTGYJFLIN'
    print(decoded)
    print(expected)
