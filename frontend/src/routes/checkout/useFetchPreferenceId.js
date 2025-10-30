import { useEffect, useState } from "react"
import { BACKEND_URL } from "../../assets/config"
import axios from "axios"

export default function useFetchPreferenceId(libro) {
  const [preferenceId, setPreferenceId] = useState(null) // State to store the preference ID
  useEffect(() => {
    // Fetch preferenceId only when `libro` changes
    const fetchPreferenceId = async () => {

      if (libro) {
        try {
          const url = `${BACKEND_URL}/api/transactions/getBookPreferenceId`

          // Prepare the payload
          const body = {
            ...libro,
            title: libro.titulo,
            price: libro.oferta !== null ? libro.oferta : libro.precio
          }

          // Make the API call
          const response = await axios.post(url, body, {
            withCredentials: true // Include credentials if necessary
          })
          console.log('Response', response.data)
          // Parse the response JSON
          if (!response.error) {
            const data = response.data
            setPreferenceId(data.id) // Assuming response includes `preferenceId`
          } else {
            console.error('Error fetching preference ID:', response.statusText)
          }
        } catch (error) {
          console.error('Error fetching preference ID:', error)
        }
      }
    }

    fetchPreferenceId()
  }, [libro]) // Dependency array ensures this runs when `libro` changes
  return [preferenceId, setPreferenceId] // Return the fetched preference ID
}