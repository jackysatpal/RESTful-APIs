const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./mongoose/mongoose');
const { User } = require('./db/user');
const { Todo } = require('./db/todo');
const { authenticate } = require('./middleware/authenticate');

const app = express();
app.use(bodyParser.json());
d
//TODOS
app.post('/todos', (req, res) => {
	
	const todo = new Todo({
		text: req.body.text
	});

	todo.save()
		.then((doc) => {
			res.send(JSON.stringify(doc, undefined, 2));
		})
		.catch((e) => {
			res.status(400)
			   .send(e);
		});

});

app.get('/todos', (req, res) => {
	
	Todo.find()
		.then((todos) => {
			res.send({
				todos
			});
		})
		.catch((e) => {
			res.status(400)
			   .send(e);
		});

});

app.get('/todos/:id', (req, res) => {
	
	const id = req.params.id;
	
	if (!ObjectID.isValid(id)) {
		return res.status(404)
		   		  .send();
	}

	Todo.findById(id)
		.then((todo) => {
			if (!todo) {
				return res.status(404)
				          .send();
			}

			res.send({
				todo
			});

		})
		.catch((e) => {
			res.status(400)
			   .send();
		});
});

app.delete('/todos/:id', (req, res) => {
	
	const id = req.params.id;

	if (!ObjectID.isValid(id)) {
		return res.status(404)
		   		   .send();
	}

	Todo.findByIdAndRemove(id)
		.then((todo) => {
			if (!todo) {
				return res.status(404)
				   	 	  .send();
			}

			res.send(todo);

		})
		.catch((e) => {
			res.status(400)
			   .send();
		});

});

app.patch('/todos/:id', (req, res) => {
	
	const id = req.params.id;
	let body = _.pick(req.body, ['text', 'completed']);

	if (_.isBoolean(body.completed) && body.completed) {
		body.completedAt = new Date().getTime();
	} else { 
		body.completed = false;
		body.completedAt = null;
	}

	if (!ObjectID.isValid(id)) {
		return res.status(404)
		   		  .send();
	}

	Todo.findByIdAndUpdate(
		id,
		{ $set: body },
		{ new: true }
	).then((todo) => {
		if (!todo) {
			return res.status(404)
					   .send();
		}

		res.send({
			todo
		});

	}).catch((e) => {
		res.status(404)
		   .send();
	});

});

//USER
app.post('/users', (req, res) => {
	const body = _.pick(req.body, ['email', 'password']);

	const user =  new User(body);

	user.save()
		.then(() => {
			return user.generateAuthToken();
		})
		.then((token) => {
			res.header('x-auth', token).send(user);
		})
		.catch((e) => {
			res.status(400)
				.send();
		});

});

app.get('/users/me', authenticate, (req, res) => {
	res.send(req.user);
});


app.post('/users/login', (req, res) => {
	const body = _.pick(req.body, ['email', 'password']);

	User.findByCredentials(body.email, body.password)
		.then((user) => {
			return user.generateAuthToken().then((token) => {
				res.header('x-auth', token).send(user);
			});
		})
		.catch((e) => {
			res.header(400).send();
		});

});

app.delete('/users/me/login', authenticate, (req, res) => {
	req.user.removeToken(req.token).then((user) => {
		res.status(200).send();
	})
	.catch((e) => {
		res.status(401).send();
	})
});

app.listen(3000, () => {
	console.log('Server is running at 3000');
});