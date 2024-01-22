const express = require('express');
const { MongoClient, ObjectId, Decimal128 } = require('mongodb');
const multer = require('multer');
const csvParser = require('csv-parser');
const { Readable } = require('stream');

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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/api/transactions', async (req, res) => {
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

app.get('/api/transactions', async (req, res) => {
    try {
        const { page = 1, pageSize = 30, Description, Date, Amount, Currency } = req.query;
        const skip = (page - 1) * pageSize; //Even though page and pageSize are strings, their numerical meaning is considered when arithmetic operations are performed on them. For ex., '30' is treated as 30. Called type coersion

        let filter = {};
        if (Description)
            filter.Description = Description;
        if (Date)
            filter.Date = Date;
        if (Amount)
            filter.Amount = parseFloat(Amount);
        if (Currency)
            filter.Currency = Currency;

        const documents = await collection.find(filter).skip(skip).limit(Number(pageSize)).toArray();
        res.json(documents);
    } catch (error) {
        console.error('Error retrieving documents:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (ObjectId.isValid(id)) {
            const document = await collection.findOne({ _id: new ObjectId(id) });
            if (document) {
                res.json(document);
            } else {
                res.status(404).json({ error: 'Document not found' });
            }
        }
        else {
            res.status(404).json({ error: 'Invalid ObjectId' });
        }
    } catch (error) {
        console.error('Error retrieving documents:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/api/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (ObjectId.isValid(id)) {
            const result = await collection.deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount > 0) {
                res.json({ message: 'Document deleted successfully' });
            } else {
                res.status(404).json({ error: 'Document not found' });
            }
        }
        else {
            res.status(404).json({ error: 'Invalid ObjectId' });
        }
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/api/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { body } = req;
        if (ObjectId.isValid(id)) {
            if (req.body.Amount !== undefined) {
                req.body.Amount = Decimal128.fromString(req.body.Amount.toString());
            }

            const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: body });
            if (result.modifiedCount > 0) {
                res.json({ message: 'Document updated successfully' });
            } else {
                res.status(404).json({ error: 'Document not found' });
            }
        } else {
            res.status(404).json({ error: 'Invalid ObjectId' });
        }
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/transactions/uploadCSV', upload.single('csvFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No CSV file uploaded.' });
        }

        const parsedData = [];
        const fileBuffer = req.file.buffer;

        const bufferStream = new Readable();
        bufferStream.push(fileBuffer);
        bufferStream.push(null);

        bufferStream
            .pipe(csvParser())
            .on('headers', (headerArray) => {
                headers = headerArray;
            })
            .on('data', (row) => {
                const rowData = {};
                headers.forEach((header, index) => {
                    rowData[header] = row[index];
                });
                parsedData.push(rowData);
            })
            .on('end', async () => {
                const result = await collection.insertMany(parsedData);
                res.json({ message: 'CSV data uploaded successfully', insertedIds: result.insertedIds });
            });
    } catch (error) {
        console.error('Error uploading CSV file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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
});

app.listen(port, () => {
    console.log(`Service is hosted at http://127.0.0.1:${port}`);
});