import { useState } from 'react'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../context/AuthContext'

export default function UserMenu({ onSignOut }) {
  const { user, signOut } = useAuth()
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const email = user?.email ?? ''
  const initial = email ? email[0].toUpperCase() : '?'

  async function handleSignOut() {
    setAnchorEl(null)
    try {
      await signOut()
      onSignOut?.()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ ml: 1 }}>
        <Avatar sx={{ width: 34, height: 34, bgcolor: '#2563eb', fontSize: 16 }}>
          {initial}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <div className="px-4 py-2">
          <Typography variant="caption" color="text.secondary">
            เข้าสู่ระบบในชื่อ
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-all' }}>
            {email}
          </Typography>
        </div>
        <Divider />
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          ออกจากระบบ
        </MenuItem>
      </Menu>
    </>
  )
}
