import { Frog } from 'frog'
import { app as gallery } from './routes/gallery'

export const app = new Frog({})

app.route('/gallery', gallery)

export default app
