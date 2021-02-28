import logging
logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s.%(msecs)03d - %(levelname)8s - %(filename)s - Function: %(funcName)20s - Line: %(lineno)4s // %(message)s',
                    datefmt='%Y-%m-%d %H:%M:%S',
                    handlers=[
                        # logging.FileHandler(filename='log.txt'),
                        logging.StreamHandler()
                    ])
# logging.disable(level=logging.CRITICAL)
logging.info('Loaded.')


class Enigma:
    """Is it as simple as saying B -> D is the same as B -> B + 2? Rotor III example using A input on AAB.
    Just switch the 'rotors' to relative references (numbers)?"""

    ROTOR_POOL = {
        'Master':      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        'I':          ['EKMFLGDQVZNTOWYHXUSPAIBRCJ', 0],
        'II':         ['AJDKSIRUXBLHWTMCQGZNPYFVOE', 0],
        'III':        ['BDFHJLCPRTXVZNYEIWGAKMUSQO', 0],
        'IV':         ['ESOVPZJAYQUIRHXLNFTGKDCMWB', 0],
        'V':          ['VZBRGITYUPSDNHLXAWMJQOFECK', 0],
        'VI':         ['JPGVOUMFYQBENHZRDKASXLICTW', 0],
        'VII':        ['NZJHGRCXMYSWBOUFAIVLPEKQDT', 0],
        'VIII':       ['FKQHTLXOCBJSPDZRAMEWNIUYGV', 0],
        'Reflector A': 'EJMZALYXVBWFCRQUONTSPIKHGD',
        'Reflector B': 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
        'Reflector C': 'FVPJIAOYEDRZXWGCTKUQSBNMHL'
    }

    def __init__(self, rotors: list, reflector: str, initial_rotor_settings: list, plug_board_connections: list = None):
        # Reference https://en.wikipedia.org/wiki/Enigma_rotor_details
        # http://accordingtobenedict.com/wp-content/uploads/2014/04/ENIGMA-scrambling-unit-copy-2.jpg
        # http://www.cs.cornell.edu/courses/cs3110/2020sp/a1/
        # https://www.101computing.net/enigma-encoder/
        # https://www.101computing.net/enigma/js/index.js

        self.plugs = {}
        self.rotor_offsets = []

        self.initial_rotor_settings = initial_rotor_settings
        self.rotor_selection = rotors
        self.reflector_selection = reflector

        if plug_board_connections:
            for connection in plug_board_connections:
                char_in, char_out = connection
                self.add_plug_board_connection(key_in=char_in, key_out=char_out)
        self.resetMachine()

    def convert_rotors_to_offsets(self):
        self.rotor_offsets.clear()
        for rotor in self.rotor_selection:
            rotor_offset = [{'LR': 0, 'RL': 0} for _ in range(26)]
            for input_sequence, output_sequence in zip(Enigma.ROTOR_POOL['Master'], Enigma.ROTOR_POOL[rotor][0]):
                for input_position, output_position in zip(input_sequence, output_sequence):
                    rl_key = ord(input_position) - 65
                    lr_key = ord(output_position) - 65
                    rl_shift = ord(output_position) - ord(input_position)
                    lr_shift = -rl_shift
                    rotor_offset[rl_key]['RL'] = rl_shift
                    rotor_offset[lr_key]['LR'] = lr_shift

            logging.debug(f"{Enigma.ROTOR_POOL['Master']} -> {Enigma.ROTOR_POOL[rotor][0]} converted to {rotor_offset}")
            self.rotor_offsets.append([rotor_offset, 0])
        logging.debug(f"ROTOR OFFSETS: {self.rotor_offsets}")

    def __str__(self):
        return str([rotor[0] for rotor in self.rotors])

    def display(self):
        return(f"Key: {Enigma.ROTOR_POOL['Master'][self.rotors[0][1]]} {Enigma.ROTOR_POOL['Master'][self.rotors[1][1]]} {Enigma.ROTOR_POOL['Master'][self.rotors[2][1]]}")

    def resetMachine(self):
        self.convert_rotors_to_offsets()
        self.rotors = [rotor for rotor in self.rotor_offsets]
        print(self.rotors)

        for spin, rotor in zip(self.initial_rotor_settings, range(3)):
            spin = spin % 26
            if spin > 0:
                self.rotors[rotor] = [self.rotors[rotor][0][spin:] + self.rotors[rotor][0][0:spin], spin]

        logging.debug(f'Initial rotor settings: {self.rotors}')
        logging.info(f'{self.display()}')

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
                logging.debug(f'Advancing rotor {r} from {rotor} to {[rotor[0][1:] + rotor[0][:1], (rotor[1] + 1) % 26]}')
                self.rotors[r] = [rotor[0][1:] + rotor[0][:1], (rotor[1] + 1) % 26]
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
            logging.info(f'{self.display()}')

            # Run in through plug board
            encoded_value = self.plugBoard(c)

            # Go from right to left
            logging.debug(f"       {Enigma.ROTOR_POOL['Master']}")
            for rotor in reversed(self.rotors):
                # Take the INDEX from the Master and look up the corresponding LETTER in the rotor
                input_letter = encoded_value
                rotor_input_index = Enigma.ROTOR_POOL['Master'].find(input_letter)
                rotor_output_offset = rotor[0][rotor_input_index]['RL']
                rotor_output_index = (rotor_input_index + rotor_output_offset + 26) % 26
                encoded_value = Enigma.ROTOR_POOL['Master'][rotor_output_index]
                logging.debug(f"{input_letter} ({rotor_input_index}) + {rotor_output_offset} -> {encoded_value} ({rotor_output_index})")

            # Handle reflector
            input_letter = encoded_value
            rotor_input_index = Enigma.ROTOR_POOL['Master'].find(input_letter)
            encoded_value = self.reflector[rotor_input_index]
            rotor_output_index = Enigma.ROTOR_POOL['Master'].find(encoded_value)
            logging.debug(f"REFLECTOR: {input_letter} ({rotor_input_index}) -> {encoded_value} ({rotor_output_index}) {self.reflector}")

            # Go from left to right
            for rotor in self.rotors:
                input_letter = encoded_value
                rotor_input_index = Enigma.ROTOR_POOL['Master'].find(encoded_value)
                rotor_output_offset = rotor[0][rotor_input_index]['LR']
                rotor_output_index = (rotor_input_index + rotor_output_offset + 26) % 26
                encoded_value = Enigma.ROTOR_POOL['Master'][rotor_output_index]
                logging.debug(f"{input_letter} ({rotor_input_index}) + {rotor_output_offset} -> {encoded_value} ({rotor_output_index})")

            # Run out through plugboard
            encoded_value = self.plugBoard(encoded_value)

            result += encoded_value

        return result


if __name__ == '__main__':
    original_message = 'GAAAAA'
    expected = 'P'  # 'BDZGO'  # 'DZGOWCXLY'
    enigma = Enigma(rotors=['I', 'II', 'III'], reflector='Reflector B', initial_rotor_settings=[25, 25, 25], plug_board_connections=None)
    decoded = enigma.encodeMessage(message=original_message)
    print(decoded)

    # picard_message = 'ONE SEVEN THREE FOUR SIX SEVEN THREE TWO ONE FOUR SEVEN SIX CHARLIE THREE TWO SEVEN EIGHT NINE SEVEN SEVEN SEVEN SIX FOUR THREE TANGO SEVEN THREE TWO VICTOR SEVEN THREE ONE ONE SEVEN EIGHT EIGHT SEVEN THREE TWO FOUR SEVEN SIX SEVEN EIGHT NINE SEVEN SIX FOUR THREE SEVEN SIX'
    # enigma = None
    # enigma = Enigma(rotors=['I', 'II', 'III'], reflector='Reflector B', initial_rotor_settings=[4, 7, 6], plug_board_connections=None)
    # encoded = enigma.encodeMessage(message=picard_message)
    # print(encoded)
    # enigma.resetMachine()
    # # enigma = Enigma(rotors=['I', 'II', 'III'], reflector='Reflector B', initial_rotor_settings=[4, 7, 6], plug_board_connections=None)
    # decoded = enigma.encodeMessage(message=encoded)
    # print(decoded)

    # block_size = 5
    # blocks = [encoded[start:start + block_size] for start in range(0, len(decoded), block_size)]
    # print(' '.join(blocks))
