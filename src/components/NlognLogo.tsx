const NlognLogo = () => {
    const logoPath = `${import.meta.env.BASE_URL}nlogn.svg`;
    
    return (
        <a 
            href="https://nlogn.info" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ cursor: 'pointer' }}
        >
            <img 
                src={logoPath}
                alt="nlogn Logo"
                style={{ 
                    display: 'block', 
                    margin: '20px auto',
                    maxWidth: '200px',
                    height: 'auto'
                }}
            />
        </a>
    );
};

export default NlognLogo; 