const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 5002;
const connection = require('./db');
const { readFile } = require('fs');
const path = require('path');
const router = express.Router();
const cors = require('cors');
module.exports = router;

app.use(cors()); 
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/par-ou-impar/:numero', (req, res) => {
  const numero = parseInt(req.params.numero); // Pega o número da URL

  if (isNaN(numero)) {
      return res.status(400).json({ error: 'O parâmetro não é um número válido.' });
  }

  // Verifica se o número é par ou ímpar
  if (numero % 2 === 0) {
      res.json({ numero: numero, resultado: 'Par' });
  } else {
      res.json({ numero: numero, resultado: 'Ímpar' });
  }
});


app.get('/converter/:unidade1/:unidade2/:numero', (req, res) => {
  let { unidade1, unidade2, numero } = req.params;
  numero = parseFloat(numero);

  let valorConvertido;
  let unidadeRetorno1 = unidade1;
  let unidadeRetorno2 = unidade2;

  if (unidade1 === 'celsius' && unidade2 === 'fahrenheit') {
    valorConvertido = (numero * 9 / 5) + 32;
    unidadeRetorno1 = '°C';
    unidadeRetorno2 = '°F';
  } else if (unidade1 === 'celsius' && unidade2 === 'kelvin') {
    valorConvertido = numero + 273.15;
    unidadeRetorno1 = '°C';
    unidadeRetorno2 = 'K';
  } else if (unidade1 === 'fahrenheit' && unidade2 === 'celsius') {
    valorConvertido = (numero - 32) * 5 / 9;
    unidadeRetorno1 = '°F';
    unidadeRetorno2 = '°C';
  } else if (unidade1 === 'fahrenheit' && unidade2 === 'kelvin') {
    valorConvertido = ((numero - 32) * 5 / 9) + 273.15;
    unidadeRetorno1 = '°F';
    unidadeRetorno2 = 'K';
  } else if (unidade1 === 'kelvin' && unidade2 === 'celsius') {
    valorConvertido = numero - 273.15;
    unidadeRetorno1 = 'K';
    unidadeRetorno2 = '°C';
  } else if (unidade1 === 'kelvin' && unidade2 === 'fahrenheit') {
    valorConvertido = ((numero - 273.15) * 9 / 5) + 32;
    unidadeRetorno1 = 'K';
    unidadeRetorno2 = '°F';
  } else {
    return res.status(400).json({ error: 'Unidades de conversão inválidas!' });
  }

  // Envia a resposta com o valor convertido e as unidades corretas
  res.json({
    valor: valorConvertido.toFixed(2), // Valor convertido com 2 casas decimais
    unidade1: unidadeRetorno1,
    unidade2: unidadeRetorno2
  });
});

app.get('/arquivos', (req, res) => {
  const caminhoArquivo = './arquivo1.txt';

  fs.readFile(caminhoArquivo, 'utf8', (err, data) => {
      if (err) {
          res.status(500).send('Erro ao ler o arquivo');
          return;
      }
      res.set({ 'Content-Type': 'text/plain' }).send(data);
  });
});

// Listar todas as tarefas
app.get('/tarefas', (req, res) => {
  connection.query('SELECT * FROM tarefa', (err, results) => {
      if (err) {
          res.status(500).json({ error: err.message });
          return;
      }
      res.json(results);
  });
});
// Listar todos os contatos
app.get('/contatos', (req, res) => {
  connection.query('SELECT * FROM contatos', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Criar uma nova tarefa
app.post('/tarefas', (req, res) => {
  const { nome, prazo, prioridade, descricao } = req.body;
  const sql = 'INSERT INTO tarefa (nome, prazo, prioridade, descricao) VALUES (?, ?, ?, ?)';
  connection.query(sql, [nome, prazo, prioridade, descricao], (err, result) => {
      if (err) {
          res.status(400).json({ error: err.message });
          return;
      }
      res.json({ id: result.insertId });
  });
});
app.post('/contatos', (req, res) => {
  const { nome, numero, email } = req.body;
  const sql = 'INSERT INTO contatos (nome, numero, email) VALUES (?, ?, ?)';
  connection.query(sql, [nome, numero, email], (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ id: result.insertId });
  });
});


// Atualizar uma tarefa
app.post('/tarefas/update/:id', (req, res) => {
  const { nome, andamento, prazo, prioridade, descricao } = req.body;
  const { id } = req.params;
  const sql = `
      UPDATE tarefa 
      SET nome = ?, andamento = ?, prazo = ?, prioridade = ?, descricao = ?, data_modificacao = CURRENT_TIMESTAMP
      WHERE id = ?
  `;
  connection.query(sql, [nome, andamento, prazo, prioridade, descricao, id], (err, result) => {
      if (err) {
          res.status(400).json({ error: err.message });
          return;
      }
      res.json({ updatedID: id });
  });
});

app.put('/contatos/:id', (req, res) => {
  const { nome, numero, email } = req.body;
  const { id } = req.params;
  const sql = `
    UPDATE contatos 
    SET nome = ?, numero = ?, email = ?
    WHERE id = ?
  `;
  connection.query(sql, [nome, numero, email, id], (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ updatedID: id });
  });
});

// Deletar uma tarefa
app.delete('/tarefas/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM tarefa WHERE id = ?', [id], (err, result) => {
      if (err) {
          res.status(400).json({ error: err.message });
          return;
      }
      res.json({ deletedID: id });
  });
});

app.delete('/contatos/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM contatos WHERE id = ?', [id], (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ deletedID: id });
  });
});



app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

app.post('/vogais-consoantes/:texto', (req, res) => {
  const { texto } = req.params;

  if (!texto) {
    return res.status(400).json({ error: 'O campo "texto" é obrigatório.' });
  }

  const vogais = texto.match(/[aeiou]/gi);
  const consoantes = texto.match(/[bcdfghjklmnpqrstvwxyz]/gi);

  const numVogais = vogais ? vogais.length : 0;
  const numConsoantes = consoantes ? consoantes.length : 0;

  res.json({
    vogais: numVogais,
    consoantes: numConsoantes
  });
});
