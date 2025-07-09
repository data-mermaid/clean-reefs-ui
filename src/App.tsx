import './styles/App.css'
import {useTranslation} from "react-i18next";
import '../i18n'

function App() {
const {t} = useTranslation()
  return (
    <>
      <h1>{t('hello_world')}</h1>
    </>
  )
}

export default App
