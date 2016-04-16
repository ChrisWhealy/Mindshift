// ********************************************************************
// Generic operations
// ********************************************************************
var adder           = val1 => val2 => val1 + val2;
var multiplier      = p    => q    => q*p;
var str_concatenate = char => acc  => acc.concat(char);
var asPlusChar      = str_concatenate('+');

// The increment and decrement functions can now be created
var incr = adder(1);
var decr = adder(-1);  

// Use the multiplier function to create partial functions that
// double, triple and quadruple their subsequent operand
var double    = multiplier(2); // ->    double = q => q*p (p = 2)  
var triple    = multiplier(3); // ->    triple = q => q*p (p = 3)  
var quadruple = multiplier(4); // -> quadruple = q => q*p (p = 4)



// ********************************************************************
// Reification functions
// ********************************************************************
var to_integer = qtyFn => qtyFn(incr)(0);  
var to_string  = qtyFn => qtyFn(asPlusChar)('');



// ********************************************************************
// Functions that operate on pairs
// ********************************************************************
var PAIR = val1 => val2 => fn => fn(val1)(val2);

var TRUE  = true_part => false_part => true_part;  
var FALSE = true_part => false_part => false_part;  

var HEAD = pair => pair(TRUE);  
var TAIL = pair => pair(FALSE);



// ********************************************************************
// Define a quantity function for ZERO.
// ********************************************************************
var ZERO = transform => start_value => start_value;

// Define a SUCCessor function.
var SUCC =  
  qtyFn =>
    transform =>
      start_value =>
        transform(qtyFn(transform)(start_value));


// ********************************************************************
// Now each quantity function can be defined simply as the successor
// of the quantity function before it.
// ********************************************************************
var ONE   = SUCC(ZERO);  
var TWO   = SUCC(ONE);  
var THREE = SUCC(TWO);  
var FOUR  = SUCC(THREE);  
var FIVE  = SUCC(FOUR);  
var SIX   = SUCC(FIVE);  
var SEVEN = SUCC(SIX);  
var EIGHT = SUCC(SEVEN);  
var NINE  = SUCC(EIGHT);  
var TEN   = SUCC(NINE);  


// ********************************************************************
// Arithmetic operations based on abstract quantity functions
// ********************************************************************
var ADD      = qtyFn1 => qtyFn2 => qtyFn1(SUCC)(qtyFn2);
var MULTIPLY = qtyFn1 => qtyFn2 => qtyFn1(ADD(qtyFn2))(ZERO);
var POWER    = qtyFn1 => qtyFn2 => qtyFn2(MULTIPLY(qtyFn1))(ONE);





