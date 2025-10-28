import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Button, Divider, IconButton } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';

import { jwtDecode } from 'jwt-decode';

const drawerWidth = 240;

interface DecodedToken {
    username: string;
    // add other token properties if needed
}

const Layout: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decodedToken: DecodedToken = jwtDecode(token);
                setUsername(decodedToken.username);
            } catch (error) {
                console.error("Invalid token:", error);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const menuItems = [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
        { text: 'Manufacturers', icon: <BusinessIcon />, path: '/companies' },
        { text: 'Products', icon: <ShoppingCartIcon />, path: '/products' },
        { text: 'Stock', icon: <InventoryIcon />, path: '/stock' },
        { text: 'Suppliers', icon: <PeopleIcon />, path: '/suppliers' },
        { text: 'Customers', icon: <PersonIcon />, path: '/customers' },
        { text: 'Purchases', icon: <ReceiptIcon />, path: '/purchases' },
        { text: 'Sale', icon: <AttachMoneyIcon />, path: '/sales' },
    ];

    const drawer = (
        <div>
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" component="div" sx={{ 
                    fontWeight: 'bold',
                    color: 'primary.main'
                }}>
                    InvoicERP
                </Typography>
            </Box>
            <Divider />
            <List>
                {menuItems.map((item, index) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton 
                            onClick={() => {
                                navigate(item.path);
                                setMobileOpen(false); // Close drawer on mobile after navigation
                            }}
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'action.hover',
                                },
                                '&.Mui-selected': {
                                    backgroundColor: 'action.selected',
                                    '&:hover': {
                                        backgroundColor: 'action.selected',
                                    }
                                }
                            }}
                        >
                            <ListItemIcon>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Box sx={{ flexGrow: 1 }} />
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton 
                        onClick={() => {
                            navigate('/settings');
                            setMobileOpen(false); // Close drawer on mobile after navigation
                        }}
                        sx={{
                            '&:hover': {
                                backgroundColor: 'action.hover',
                            }
                        }}
                    >
                        <ListItemIcon>
                            <SettingsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Settings" />
                    </ListItemButton>
                </ListItem>
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        InvoicERP
                    </Typography>
                    {username && <Typography sx={{ mr: 2 }}>Welcome, {username}</Typography>}
                    <Button color="inherit" onClick={handleLogout}>Logout</Button>
                </Toolbar>
            </AppBar>
            
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="mailbox folders"
            >
                {/* Mobile drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            backgroundColor: 'background.paper',
                            borderRight: '1px solid',
                            borderColor: 'divider',
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                
                {/* Desktop drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            backgroundColor: 'background.paper',
                            borderRight: '1px solid',
                            borderColor: 'divider',
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            
            <Box
                component="main"
                sx={{ 
                    flexGrow: 1, 
                    bgcolor: 'background.default', 
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` }
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;
