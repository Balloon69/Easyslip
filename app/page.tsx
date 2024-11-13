'use client'
import React, { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Container from '@mui/material/Container'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'

export default function Page() {
  // ประกาศ state variables เพื่อเก็บข้อมูล URL ของรูปภาพ, จำนวนเงิน, ชื่อผู้โอน และข้อความแสดงข้อผิดพลาด
  const [images, setImages] = useState<string[]>([])
  const [amounts, setAmounts] = useState<string[]>([])
  const [senders, setSenders] = useState<string[]>([])
  const [errorMessages, setErrorMessages] = useState<string[]>([])

  // ฟังก์ชันสำหรับจัดการการเลือกไฟล์ภาพ และอัปเดต URL ของรูปภาพใน state
  const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedImages = Array.from(event.target.files).map((file) =>
        URL.createObjectURL(file)
      )
      setImages(selectedImages)
      setErrorMessages(new Array(selectedImages.length).fill(''))
    }
  }

  // ฟังก์ชัน async เพื่ออัปโหลดรูปภาพไปยังเซิร์ฟเวอร์ และดึงข้อมูลจำนวนเงินและชื่อผู้โอน
  async function easyslip(file: File, index: number) {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/easyslip/api', {
        method: 'POST',
        body: formData
      })
      if (!res.ok) throw new Error('Failed to fetch data from the server')
      const data = await res.json()
      console.log(data)

      // ตรวจสอบข้อมูลจาก API และอัปเดตจำนวนเงิน, ชื่อผู้โอน และข้อความแสดงข้อผิดพลาดตามข้อมูลที่ได้รับ
      if (data && data.data && data.data.data) {
        setAmounts((prev) => {
          const newAmounts = [...prev]
          newAmounts[index] = data.data.data.amount?.amount || 'ไม่พบข้อมูลจำนวนเงิน'
          return newAmounts
        })
        setSenders((prev) => {
          const newSenders = [...prev]
          newSenders[index] = data.data.data.sender?.account?.name?.th || 'ไม่พบข้อมูลผู้โอน'
          return newSenders
        })
        setErrorMessages((prev) => {
          const newErrors = [...prev]
          newErrors[index] = ''  // ล้างข้อความผิดพลาดหากข้อมูลถูกต้อง
          return newErrors
        })
      } else {
        // ตั้งค่าข้อความผิดพลาด หากโครงสร้างข้อมูลจาก API ไม่ถูกต้อง
        setErrorMessages((prev) => {
          const newErrors = [...prev]
          newErrors[index] = 'โครงสร้างข้อมูลจาก API ไม่ถูกต้อง'
          return newErrors
        })
      }
    } catch (error) {
      // จัดการกรณีที่เกิดข้อผิดพลาดในการอัปโหลดไฟล์
      console.error('Error uploading file:', error)
      setErrorMessages((prev) => {
        const newErrors = [...prev]
        newErrors[index] = 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์'
        return newErrors
      })
    }
  }

  // ฟังก์ชันสำหรับจัดการการส่งแบบฟอร์ม และเรียกใช้ easyslip() สำหรับแต่ละไฟล์
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setAmounts([])
    setSenders([])
    setErrorMessages([])

    const fileInput = (event.target as HTMLFormElement).elements.namedItem('file') as HTMLInputElement
    if (fileInput?.files) {
      const requests = Array.from(fileInput.files).map((file, index) =>
        easyslip(file, index)
      )
      await Promise.all(requests)
    } else {
      setErrorMessages(['กรุณาเลือกไฟล์ก่อนที่จะอัปโหลด'])
    }
  }

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px' }}>
      {/* AppBar - แถบการนำทางด้านบน พร้อมชื่อแอป */}
      <AppBar position="static" style={{ background: 'linear-gradient(to right, #1e88e5, #2196f3)' }}>
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SlipCheck
          </Typography>
        </Toolbar>
      </AppBar>
      
      {/* Container หลัก พร้อมแบบฟอร์มสำหรับการอัปโหลดและตรวจสอบสลิป */}
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Card variant="outlined" sx={{ padding: 3, textAlign: 'center', borderRadius: '12px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}>
          <Typography variant="h5" component="h2" align="center" gutterBottom style={{ fontWeight: 600, color: '#333' }}>
            ตรวจสอบสลิปการโอนเงิน
          </Typography>

          {/* แบบฟอร์มสำหรับอัปโหลดและส่งรูปสลิป */}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {/* ปุ่มอัปโหลด */}
              <Grid item xs={6}>
                <Button
                  component="label"
                  variant="contained"
                  style={{ background: 'linear-gradient(to right, #42a5f5, #1e88e5)', color: 'white', borderRadius: '8px', fontWeight: 600 }}
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                >
                  อัปโหลดสลิป
                  <input
                    type="file"
                    id="file"
                    name="file"
                    onChange={onImageChange}
                    multiple
                    style={{ display: 'none' }}
                  />
                </Button>
              </Grid>

              {/* ปุ่มส่งแบบฟอร์ม */}
              <Grid item xs={6}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  style={{ background: 'linear-gradient(to right, #ab47bc, #8e24aa)', color: 'white', borderRadius: '8px', fontWeight: 600 }}
                >
                  ตรวจสอบสลิป
                </Button>
              </Grid>
            </Grid>

            {/* แสดงภาพสลิปที่อัปโหลด */}
            <Stack spacing={2} sx={{ mb: 2 }}>
              {images.map((image, index) => (
                <Card key={index} variant="outlined" sx={{ textAlign: 'center', borderRadius: '8px', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)' }}>
                  <CardMedia
                    component="img"
                    height="600"
                    image={image}
                    alt={`Slip ${index + 1}`}
                    sx={{ borderRadius: '8px', mb: 2 }}
                  />
                  <Typography>Slip {index + 1}</Typography>
                </Card>
              ))}
            </Stack>
          </form>

          {/* แสดงข้อความผลลัพธ์สำหรับแต่ละสลิป */}
          <Stack spacing={2} sx={{ mt: 3 }}>
            {images.map((_, index) => (
              <Alert 
                severity={errorMessages[index] ? "error" : (senders[index] === 'ไม่พบข้อมูลผู้โอน' || amounts[index] === 'ไม่พบข้อมูลจำนวนเงิน' ? "error" : "info")}
                key={index}
                style={{ borderRadius: '8px' }}
              >
                {errorMessages[index] ? (
                  <Typography>{errorMessages[index]}</Typography>
                ) : (
                  <>
                    <Typography style={{ fontWeight: 600 }}>
                      {senders[index] === 'ไม่พบข้อมูลผู้โอน' || amounts[index] === 'ไม่พบข้อมูลจำนวนเงิน' 
                        ? "ไม่สามารถตรวจสอบได้" 
                        : "ตรวจสอบสำเร็จ"}
                    </Typography>
                    {senders[index] !== 'ไม่พบข้อมูลผู้โอน' && (
                      <Typography>ผู้โอน: {senders[index]}</Typography>
                    )}
                    {amounts[index] !== 'ไม่พบข้อมูลจำนวนเงิน' && (
                      <Typography>จำนวนเงิน: {amounts[index]}</Typography>
                    )}
                  </>
                )}
              </Alert>
            ))}
          </Stack>
        </Card>
      </Container>
    </div>
  )
}
