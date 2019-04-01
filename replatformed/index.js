// Azure Discovery Day Sample file 
// **

// Defaults :: Please provide the valus which apply to your subscription

// let DefaultContainerName = "<yourContainerName>";
//let StorageConnectionString = "<yourConnectStringToStorageAccount>";
// let DefaultVisionKey = "<yourVisionApiKey>";

DefaultContainerName = "images";
StorageConnectionString = "DefaultEndpointsProtocol=https;AccountName=phwecker00blob;AccountKey=huFdA9TTBPAurq4ecg8f7v5VGnla96Zuz0nwXXA5zvaBK/SwD3MlQsnYbrLdkTn9Pr+p5uWC/SdlL31sujGX6Q==;EndpointSuffix=core.windows.net";
DefaultVisionKey = "902a0535e90c47e1873c719e1cd5db27";

// Dependencies

const express = require('express')
const app = express();

const fileUpload = require('express-fileupload');
const fs = require('fs');
const getStream = require('into-stream');

const path = require('path');
const storage = require('azure-storage');

const https = require('https');

const blobStorage = storage.createBlobService(StorageConnectionString);

// Settings

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'));

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : 'tmp/'
}));

app.set('port', process.env.PORT || 3000);

// Helpers

const listBlobs = async (containerName) => {
    return new Promise ((resolve, reject) => {
        blobStorage.listBlobsSegmented(containerName, null, (err, data) => {
            if (err) {
                reject(err);
            } else {
                console.log(data.entries)
                resolve({blobs: data.entries});
            }
        })
    })
} 

const storeFileUpload = async (containerName, fileHandle) => {
    return new Promise ((resolve, reject) => {
        
        const stream = fs.createReadStream(fileHandle.tempFilePath);
        const streamLength = fileHandle.size;

        blobStorage.createBlockBlobFromStream(containerName, fileHandle.name, stream, streamLength, null, (err, data) => {
            if (err) {
                reject('error');
            } else {
                resolve(data);
            }
        })
    })
} 

const getBlobURL = (containerName, blobName) => {
    var startDate = new Date();
    var expiryDate = new Date(startDate);
    expiryDate.setMinutes(startDate.getMinutes() + 100);
    startDate.setMinutes(startDate.getMinutes() - 100);

    var sharedAccessPolicy = {
    AccessPolicy: {
        Permissions: storage.BlobUtilities.SharedAccessPermissions.READ,
        Start: startDate,
        Expiry: expiryDate
    }
    };

    var token = blobStorage.generateSharedAccessSignature(containerName, blobName, sharedAccessPolicy);
    return (blobStorage.getUrl(containerName, blobName, null));
}

const visionDescribe = async (imageUrl) => {
    return new Promise ((resolve, reject) => {
        const visionPayload = JSON.stringify({"url": imageUrl});
        let visionResponse = {};

        console.log ('*** Vision');

        var options = {
            host: 'westeurope.api.cognitive.microsoft.com',
            port: 443,
            path: '/vision/V1.0/analyze?visualFeatures=Tags,Faces,Description',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': visionPayload.length,
                'Ocp-Apim-Subscription-Key' : DefaultVisionKey
            }
        };
        
        let resBody = '';
        var req = https.request(options, (res) => {      
            res.on('data', (d) => {
                // process.stdout.write(d)
                resBody += d;
                visionResponse = JSON.parse(resBody);
                console.log(visionResponse);
                resolve (visionResponse);
            });
        });

      req.write(visionPayload);
      req.end();


      req.on('error', (e) => {
        console.log(e);
        reject (e);
      });
    });
}

// Endpoints

app.get('/', (req,res) => {
    let blobUrls = [];
    listBlobs(DefaultContainerName)
    .then((allBlobs)=>{
        for (i=0; i < allBlobs.blobs.length; i++)
        {
            blobUrls[i] = getBlobURL(DefaultContainerName,allBlobs.blobs[i].name);
        }
        Promise.all(blobUrls).then((blobUrls)=> {
            res.render('pages/upload',
            { 
                listBlobs : allBlobs,
                urls : blobUrls
            });
        });
    });
})

app.post('/upload', async function(req, res) {
    let response;

    try {
        response = storeFileUpload(DefaultContainerName, req.files.file4storage);
            response.then((response) => {
            console.log('Upload done.');
            const fileURL = getBlobURL(DefaultContainerName,req.files.file4storage.name);
            vision =  visionDescribe(fileURL);
            vision.then((imageAnalysis) =>{
                res.render ('pages/success',
                {   fileSummary: response, 
                    fileUrl : fileURL,
                    visionResult : imageAnalysis
                });
            })

        });
    } catch (err) {
        console.log (err);
        res.send(err);
    }

});

// Server Process

app.listen(app.get('port'), () => console.log(`Example app listening on port ` + app.get('port')))
