import { useContext, useState, useRef, useEffect } from "react"
import { useReturnIfNoUser } from "../../assets/useReturnIfNoUser"
import { UserContext } from "../../context/userContext"
import "./protectedSeeEmailTemplate.css"
import { BACKEND_URL } from "../../assets/config"
import axios from "axios"
export default function ProtectedSeeEmailTemplate () {
  const { user, loading } = useContext(UserContext)
  const [options, setOptions] = useState([])
  useReturnIfNoUser(user, loading, true)
  const [content, setContent] = useState('')
  // Declaro un ref para el debounce
  const debounceRef = useRef(null)

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/emailTemplate/fetchTemplates`)
        const data = response.data
        if (Array.isArray(data)) {
          setOptions(data)
          return
        }
      } catch (error) {
        console.error('Error fetching templates:', error)
      }
    }
    fetchTemplates()
  }, [])
  async function fetchData (e) {
    const template = e.target.value ?? ''

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      const response = await axios.get(`${BACKEND_URL}/api/emailTemplate/${template}`)
      const data = response.data

      setContent(data.content)
    }, 500) // 500ms debounce
  }


  return (
    <div className="protectedContainer">
      <select name="emailTemplates" id="emailTemplates" onChange={fetchData}>
        <option value="">Select a template</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
      <div
        className="templateVisualization"
        dangerouslySetInnerHTML={{ __html: content || "<p>No content available</p>" }}
      />
    </div>
  )
}