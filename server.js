require('dotenv').config();
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
app.use(bodyParser.urlencoded({ extended: false }))

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const ExerciseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, min: 1, required: true },
  date: { type: String }
}, { _id: false });

const user = new mongoose.Schema({
  username: {
    type: String,
  },
  id: Number,
  count: { type: Number },
  log: { type: Array, value: ExerciseSchema }
})

const User = mongoose.model('Exercise Users', user)

app.route('/api/users').post(async (req, res) => {
  const addedUser = req.body.username
  let docCount = await User.countDocuments({}).exec();
  let highest = await User.findOne({}).sort('-id').exec()
  let num;
  highest === null ? num = 1 : num = highest.id + 1
  
  User.findOne({username: addedUser}, (err, data) => {
    if (err) {
      console.log(err)
    }
    if (data != null) {
      console.log('yes, already there')
      res.json("username already exists")
      return;
    } else {
        User.create({username: addedUser, id: num}, (err, data) => {
          if (err) {
            console.log(err)
          } (data) => {}
        } )
        return res.json({username: addedUser, _id: num})
    }
  })
}).get((req, res) => {
  User.find({}, (err, data) => {
    if (err) {
      console.log(err)
    } 
    res.json(data)
  })
})

const validDate = dateString => {
  let date;
  if (+dateString) {
    date = new Date(+dateString);
  } else if (dateString === undefined) {
    date = new Date();
  } else {
    date = new Date(dateString);
  }
  if (date.getTime() === NaN || date.toUTCString() === "Invalid Date") {
    return false;
  } else {
    return true;
  }
}

app.post('/api/exercise/add', (req, res, next) => {
  let userId = req.body.userId
  let description = req.body.description
  let duration = req.body.duration
  let date = req.body.date
  if (date === '') {
    date = new Date()
  }
  if (!validDate(date)) {
    return res.json('please enter a valid date')
  }

  if (userId === '' || description === '' || duration === '') {
    return res.json('please enter the required fields')
  } 
  
  User.findOne({id: userId}, (err, data) => {
    if (err) next(err);
    if (!data) return res.json('Unknown UserId');
    let { _id, username, log, count } = data;
    log.push({ description: description, duration: duration, date: date.toUTCString() });
    log.sort((a, b) => new Date(b.date) - new Date(a.date));
    count = log.length;
    data.save((err, user) => {
      if (err) next(err);
      res.json({ _id, username, count, log });
    });
  })
})

app.get('/api/users/:_id/logs', (req, res)=> {
  let reqId = req.params._id
  User.findOne({id: reqId}, (err, data) => {
    res.json({data, count: data.log.length})
  })
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
