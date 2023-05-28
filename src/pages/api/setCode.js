import { useEffect } from "react"

export default function handler(req, res) {
    useEffect(()=>{
        localStorage.setItem('gapiToken',req.params.token)
    },[])
    res.redirect('/')
}
  