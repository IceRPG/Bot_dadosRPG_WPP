const fs = require('fs');
const wppconnect = require('@wppconnect-team/wppconnect');

wppconnect
  .create({
    session: 'sessionName',
    catchQR: (base64Qr, asciiQR) => {
      console.log(asciiQR); // Optional to log the QR in the terminal
      const matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

      if (!matches || matches.length !== 3) {
        console.error('Invalid input string for QR code');
        return;
      }

      const imageBuffer = Buffer.from(matches[2], 'base64');
      fs.writeFile('out.png', imageBuffer, 'binary', function (err) {
        if (err) {
          console.error(err);
        } else {
          console.log('QR code saved as out.png');
        }
      });
    },
    logQR: false,
  })
  .then((client) => start(client))
  .catch((error) => console.error(error));

function start(client) {
  client.onMessage((message) => {
    if (message.body && message.body.startsWith('/rolar')) {
      try {
        const parts = message.body.split(" ");
        const [num_rolls, sides] = parts[1].split('D').map(Number);
        const modifier = Number(parts[3]);

        const rolls = [];
        let total_rolagem = 0;

        for (let i = 0; i < num_rolls; i++) {
          const roll = Math.floor(Math.random() * sides) + 1;
          rolls.push(roll);
          total_rolagem += roll;
        }

        const total = total_rolagem + modifier;

        const rolls_str = rolls.join(' + ');
        const response_ind = `Rolagens: (${rolls_str})`;
        const response = `Total rolagens: ${total_rolagem}\nTotal geral: ${total}`;

        console.log(response_ind);
        console.log(response);

        // Resposta via WhatsApp
        const replyMessage = `${response_ind}\n${response}`;
        client.sendText(message.from, replyMessage); // Enviar a resposta para o remetente

                
      } catch (error) {
        console.error("Erro:", error);
      }
    }
  });
}
