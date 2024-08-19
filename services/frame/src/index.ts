import { Frog } from 'frog'
import { app as gallery } from './routes/gallery'

export const app = new Frog({
  title: 'koda.art gallery',
})

app.route('/gallery', gallery)

export default app
