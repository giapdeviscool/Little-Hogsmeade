import { AppRouter } from './router'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <>
      <AppRouter />
      <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
    </>
  )
}

export default App
