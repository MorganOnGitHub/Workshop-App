const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

const url = 'mongodb://127.0.0.1/bookings';
mongoose.connect(url)
  .then(() => {
    console.log('Connected to HTML Mastery\'s Bookings Database.');
  })
  .catch(err => {
    console.error('Error connecting to HTML Mastery\'s Bookings Database: ' + err);
  });

const userBookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone_number: Number,
  date_booking: Date
});

const Booking = mongoose.model('Booking', userBookingSchema);

app.use(express.urlencoded({ extended: true })); // Allows use of req.body

app.post('/create', (req, res) => {
  const name = req.body.userName;
  const email = req.body.userEmail;
  const phoneNumber = req.body.userPhone;
  const date = req.body.userBookingDate;

  
  const newBooking = new Booking({
    name,
    email,
    phone_number: phoneNumber,
    date_booking: date,
  });

  
  newBooking.save()
    .then(() => {
      res.send(`Received data and saved to the database: Name - ${name}, Email - ${email}, Phone - ${phoneNumber}, Date - ${date}`);
    })
    .catch(err => {
      console.error('Error saving booking data: ' + err);
      res.send('Error saving booking data.');
    });
});

app.set('view engine', 'ejs'); // allows use of res.render
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/create', (req, res) => {
  res.render('create');
});

app.get('/help', (req, res) => {
  res.render('help');
});

app.get('/viewbookings', async (req, res) => {
  const bookings = await Booking.find({});
  res.render('viewbookings', { bookings });
});

app.get('/edit/:bookingId', async (req, res) => {
  const bookingId = req.params.bookingId;

  try {
      const booking = await Booking.findById(bookingId);
      res.render('edit', { booking });
  } catch (err) {
      console.error('Error retrieving booking for edit: ' + err);
      res.send('Error retrieving booking for edit.');
  }
});

app.post('/edit/:bookingId', async (req, res) => {
  const bookingId = req.params.bookingId;

  try {
      await Booking.findByIdAndUpdate(bookingId, req.body);
      res.redirect('/viewbookings');
  } catch (err) {
      console.error('Error updating booking: ' + err);
      res.send('Error updating booking.');
  }
});

app.post('/delete/:bookingId', async (req, res) => {
  const bookingId = req.params.bookingId;

  try {
      await Booking.findByIdAndDelete(bookingId);
      res.redirect('/viewbookings');
  } catch (err) {
      console.error('Error deleting booking: ' + err);
      res.send('Error deleting booking.');
  }
});

app.post('/viewbookings', async (req, res) => {
  const bookings = await Booking.find({name: req.body.user_name,  date_booking: {$gte: req.body.start_date, $lte: req.body.end_date}});
  res.render('viewbookings', { bookings });
});


