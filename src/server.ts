import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

// Dev-imported packages
import { isURL } from 'validator';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // IMPLEMENT A USEFUL ENDPOINT
  app.get("/filteredimage", async (req, res) => {
    // fail if no parameter provided
    if (!req.query.image_url) {
      res.status(400).send("Must include image_url as a query parameters");
      return;
    }

    // fail if url is invalid
    if (!isURL(req.query.image_url)) {
      res.status(422).send("image_url is invalid");
      return;
    }

    // filter image at the URL given in the query
    let image: string;
    try {
      image = await filterImageFromURL(req.query.image_url);
    } catch(err) {
      res.status(500).send(`An error occurred in filterImageFromURL: ${err}`);
      return;
    }

    // send file and error out if problem
    res.status(200).sendFile(image, async (err) => {
      if (err) {
        res.status(500).send(`An error occurred sending File: ${err}`);
        return;
      }

      // cleanup
      try {
        await deleteLocalFiles([image]);
      } catch(err) {
        throw `An error occurred in deleteLocalFiles: ${err}`;
      }
    });
  });

  /**************************************************************************** */

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}");
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();