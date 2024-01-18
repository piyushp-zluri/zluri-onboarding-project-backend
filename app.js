const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

app.use(express.json());

const uri = 'mongodb+srv://piyush_zluri:piyush%401234@cluster0.fqocxgk.mongodb.net/transProjDB?retryWrites=true&w=majority';
//password is piyush@1234 but it must be converted to percent encoding. Code for '@' is %40
const client = new MongoClient(uri);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connectToDatabase();

const db = client.db();
const collection = db.collection('transactions');

app.post('/api/add', async (req, res) => {
    try {
        const { body } = req;
        /*
        if (!body.date || new Date(body.date) >= new Date()) {
            return res.status(400).json({ error: 'Invalid date. Date should be in the past.' });
        }
        if (!body.currency || !isValidCurrency(body.currency)) {
            return res.status(400).json({ error: 'Invalid currency.' });
        }
        */
        /*
        if (!body.amount || isNaN(body.amount) || body.amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount. Amount should be greater than 0.' });
        }
        if (!body.description || body.description.trim() === '') {
            return res.status(400).json({ error: 'Invalid description. Description should be non-empty.' });
        }
        */
        const result = await collection.insertOne(body);
        res.json({ _id: result.insertedId });
    } catch (error) {
        console.error('Error creating document:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/view', async (req, res) => {
    try {
        const { page = 1, pageSize = 30, Description, Date, Amount, Currency } = req.query;
        const skip = (page - 1) * pageSize; //Even though page and pageSize are strings, their numerical meaning is considered when arithmetic operations are performed on them. For ex., '30' is treated as 30. Called type coersion

        const filter = {};
        if (Description)
            filter.Description = Description;
        if (Date)
            filter.Date = Date;
        if (Amount)
            filter.Amount = parseFloat(Amount);
        if (Currency)
            filter.Currency = Currency;

        const documents = await collection.find(query).skip(skip).limit(Number(pageSize)).toArray();
        res.json(documents);
    } catch (error) {
        console.error('Error retrieving documents:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Service is hosted at http://127.0.0.1:${port}`);
});