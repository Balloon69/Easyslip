import { NextRequest } from "next/server";

export async function POST(request:NextRequest) {
    const formData = await request.formData()
    const res = await fetch ('https://developer.easyslip.com/api/v1/verify',{
        method: 'POST',
        headers:{
            'Authorization':`Bearer ${process.env.API_KEY}`
        },
        body: formData
    })
    const data = await res.json()
    return Response.json({ data })

    
}