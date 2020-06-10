import {
  getDistDirectory, renderAltair, renderInitialOptions, RenderOptions,
} from 'altair-static';
import express from 'express';

export const altairMiddleware = (props: IProps) => {
  const {
    endpoint, subscriptionEndpoint,
  } = props;
  const router = express.Router();
  const altairOptions: RenderOptions = {
    endpointURL: endpoint,
    subscriptionsEndpoint: subscriptionEndpoint,
  };
  router.get('/', (req, res) => {
    if (req.originalUrl.substr(-1) !== '/') {
      // We need the trailing slash to enable relative file paths to work
      return res.redirect(301, `${req.originalUrl}/`);
    }


    return res.send(renderAltair(altairOptions));
  });

  router.get('/initial_options.js', (req, res) => {
    res.set('Content-Type', 'text/javascript');
    return res.send(renderInitialOptions(altairOptions));
  });
  router.use(express.static(getDistDirectory()));


  return router;
};

interface IProps {
  endpoint: string;
  subscriptionEndpoint: string;
}

export default altairMiddleware;
