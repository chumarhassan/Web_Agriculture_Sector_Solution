const Card = ({ children, className = '', hover = false, onClick }) => {
  const hoverClass = hover ? 'card-hover cursor-pointer' : '';
  
  return (
    <div 
      className={`card ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
