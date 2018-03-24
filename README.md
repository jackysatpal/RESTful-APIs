# RESTful-APIs

A Todo application to demostrate RESTful-APIs.  
Developed in Node.js, Express.js and MongoDB.

User can signup and login the application. After login, they can peform CRUD operations. 

To save data in the MongoDB, `Mongoose` an ORM is used to create Schemas. 
When a user saves a new `doc` in the MongoDB then an instance of the Schema is created. 
Below is the example of `ToDo Schema` create in `Mongoose`.

```node
const mongoose = require('mongoose');

const Todo = mongoose.model('Todo', {
  
  text: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  }

});

module.exports = {
  Todo
};
```

[JsonWebToken](https://jwt.io/) is used for authentication.

BCrypt is used for password encryption.

Once a user is sign up then they will get back a token from JWT.  
Below is the code for creating that token:

```node
UserSchema.methods.generateAuthToken = function() {
	const user = this;
	const access = 'auth';
	const token = jwt.sign({
							_id: user._id.toHexString(),
							access
						}, 'secret').toString();

	user.tokens = user.tokens.concat([{ access, token }]);

	return user.save().then(() => {
		return token;
	});

}
```

When the user, login then the plain password is hashed and compared with the password in the MongoDB.  
Below is the code for that:

```node
UserSchema.statics.findByCredentials = function(email, password) {
	const User = this;

	return User.findOne({ email })
				.then((user) => {
					
					if (!user) {
						return Promise.reject();
					}

					return new Promise((resolve, reject) => {
						bcrypt.compare(password, user.password, (err, res) => {
							
							if (res) {
								resolve(user);
							} else {
								reject();
							}

						});

					});
	});	
}
```
