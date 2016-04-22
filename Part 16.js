// ----------------------------------------------------------------------------
// Generic operations
// ----------------------------------------------------------------------------
var adder = val1 => val2 => val1 + val2;

var incr = adder(1);
var decr = adder(-1);  


// ----------------------------------------------------------------------------
// Reification functions
// ----------------------------------------------------------------------------
var magnitude  = qtyFn => qtyFn(incr)(0);
var to_boolean = fn    => fn(true)(false);



// ----------------------------------------------------------------------------
// Boolean Operators
// ----------------------------------------------------------------------------
var TRUE  = true_part => false_part => true_part;  
var FALSE = true_part => false_part => false_part;  



// ----------------------------------------------------------------------------
// Pair Operators
// ----------------------------------------------------------------------------
var PAIR = headVal => tailVal => pairFn => pairFn(headVal)(tailVal);

var HEAD = pair => pair(TRUE);  
var TAIL = pair => pair(FALSE);



// ----------------------------------------------------------------------------
// Numeric functions
// ----------------------------------------------------------------------------

// Numeric functions returning abstract functions
// SIGN and ABS are just synonyms for HEAD and TAIL when applied specifically
// to a NUMBER
var SIGN = number => HEAD(number);
var ABS  = number => TAIL(number);

// Numeric functions returning native data types
var sign = number => to_boolean(HEAD(number))
var abs  = number => magnitude(TAIL(number));



// ----------------------------------------------------------------------------
// Numeric predicates
// ----------------------------------------------------------------------------

// Numeric predicates returning abstract functions
var IS_POS = number => HEAD(number);

// Numeric predicates returning native data types
var is_pos  = number => to_boolean(HEAD(number));


// ----------------------------------------------------------------------------
// Abstract quantity functions are simply functions that apply a transformation
// function a predetermined number of times to a starting value.
//
// The number of times the transformation is applied represents the quantity
// function's magnitude.
//
// The following functions operate only on the magnitude of a number
// ----------------------------------------------------------------------------
// var ZERO_MAGNITUDE = transform => start_value => start_value;
var ZERO = transform => start_value => start_value;



// ----------------------------------------------------------------------------
// A number is the pair formed from a sign and a magnitude, where:
//   The sign is held in the "isPositive" abstract Boolean property
//   The magnitude is an abstract quantity function
//
// ZERO is arbitrarily assigned an isPositive property value of TRUE and is
// formed from the PAIR of TRUE and the quantity function ZERO_MAGNITUDE
//
// All functions that operate on NUMBERs must handle both sign and magnitude
// ----------------------------------------------------------------------------
var NUMBER = isPositive => qtyFn => PAIR(isPositive)(qtyFn);

// var ZERO   = NUMBER(TRUE)(ZERO_MAGNITUDE);


// If you rename the above definition of ZERO to ZERO_MAGNITUDE, then uncomment
// the new definition of ZERO above, you will have the starting point for
// representing signed integers, but this will also break the functionality of
// the SUCCessor function...


var SUCC =  
  qtyFn =>
    transform =>
      start_value => transform(qtyFn(transform)(start_value));




// ----------------------------------------------------------------------------
// Declare a few numbers to make testing easier
// ----------------------------------------------------------------------------
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



