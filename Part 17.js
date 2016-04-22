// ----------------------------------------------------------------------------
// Generic operations
// ----------------------------------------------------------------------------
var adder = val1 => val2 => val1 + val2;

var incr = adder(1);
var decr = adder(-1);  


// ----------------------------------------------------------------------------
// Reification functions
// ----------------------------------------------------------------------------
var magnitude  = qtyFn  => qtyFn(incr)(0);
var to_boolean = fn     => fn(true)(false);
var to_integer = number =>
    // Inner function
    (sign => mag => sign ? mag : mag * -1)
    // Supply the sign and mag parameters to the inner function
    (to_boolean(SIGN(number)))
    (magnitude(ABS(number)));


// ----------------------------------------------------------------------------
// Boolean Operators
// ----------------------------------------------------------------------------
var TRUE  = true_part => false_part => true_part;  
var FALSE = true_part => false_part => false_part;  

var NOT = bool => bool(FALSE)(TRUE);  

var AND = bool1 => bool2 => bool1(bool2)(FALSE);  
var OR  = bool1 => bool2 => bool1(TRUE)(bool2);  
var XOR = bool1 => bool2 => bool1(NOT(bool2))(bool2);



// ----------------------------------------------------------------------------
// Pair Operators
// ----------------------------------------------------------------------------
var PAIR = headVal => tailVal => pairFn => pairFn(headVal)(tailVal);

var HEAD = pair => pair(TRUE);  
var TAIL = pair => pair(FALSE);



// ----------------------------------------------------------------------------
// Abstract defintions of the magnitudes 0 and 1
// ----------------------------------------------------------------------------
var ZERO_MAGNITUDE = transform => start_value => start_value;
var UNIT_MAGNITUDE = transform => start_value => transform(start_value);



// ----------------------------------------------------------------------------
// Calculate the successor and predecessor of a given quantity function
// ----------------------------------------------------------------------------
var SUCC_MAGNITUDE =  
  qtyFn =>
    transform =>
      start_value =>
        transform(qtyFn(transform)(start_value));

var SUCC_MAGNITUDE_PAIR = pair => PAIR(pair(FALSE))(SUCC_MAGNITUDE(pair(FALSE)));

var PRED_MAGNITUDE = qtyFn => qtyFn(SUCC_MAGNITUDE_PAIR)
                                   (PAIR(ZERO_MAGNITUDE)(ZERO_MAGNITUDE))
                                   (TRUE);



// ----------------------------------------------------------------------------
// Numeric predicates
// ----------------------------------------------------------------------------

// Numeric predicates returning abstract functions
var IS_POS = number => HEAD(number);

// Numeric predicates returning native data types
var is_pos  = number => to_boolean(HEAD(number));

var HAS_ZERO_MAGNITUDE = number => ABS(number)(dont_care => FALSE)(TRUE);
var HAS_UNIT_MAGNITUDE = number => magnitude(ABS(number)) === 1 ? TRUE : FALSE;

var IS_ONE       = number => HAS_UNIT_MAGNITUDE(number);
var IS_ZERO      = number => HAS_ZERO_MAGNITUDE(number);
var IS_MINUS_ONE = number => AND(NOT(IS_POS(number)))
                                (HAS_UNIT_MAGNITUDE(number));




// ----------------------------------------------------------------------------
// Numeric functions
// ----------------------------------------------------------------------------

// Numeric functions returning abstract functions
// SIGN and ABS are just synonyms for HEAD and TAIL when applied specifically
// to a NUMBER
var SIGN = number => IS_POS(number);
var ABS  = number => TAIL(number);

// Numeric functions returning native data types
var sign = number => to_boolean(HEAD(number))
var abs  = number => magnitude(TAIL(number));



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
var ZERO   = NUMBER(TRUE)(ZERO_MAGNITUDE);





// ----------------------------------------------------------------------------
// SUCCessor and PREDecessor functions that can handle abstract signed integers
// ----------------------------------------------------------------------------
var SUCC =  
  number =>
    // Is the number positive?
    IS_POS(number)
          // Yup, so it must be >= 0, therefore return the positive
          // number created by calling SUCC_MAGNITUDE on the number's
          // absolute value
          (NUMBER(TRUE)(SUCC_MAGNITUDE(ABS(number))))

          // Nope, so check for the special case of minus one
          (IS_MINUS_ONE(number)
                       // Yup, so return SUCC(-1) = ZERO
                       (ZERO)

                       // Nope, so the number must be <= -2
                       // Therefore, return the negative number
                       // created by calling PRED_MAGNITUDE on the
                       // number's absolute value
                       (NUMBER(FALSE)(PRED_MAGNITUDE(ABS(number)))));

var PRED =  
  number =>
    // Check for the special case of zero
    (IS_ZERO(number)
            // Yup, so return PRED(0) = -1
            (NUMBER(FALSE)(UNIT_MAGNITUDE))
            // Is the number positive?
            (IS_POS(number)
                   // Yup, so the number must be >= 1
                   // Return the positive number created by calling
                   // PRED_MAGNITUDE on the number's absolute value
                   (NUMBER(TRUE)(PRED_MAGNITUDE(ABS(number))))

                   // Nope, so the number must be <= -1
                   // Therefore, return the negative number
                   // created by calling SUCC_MAGNITUDE on the
                   // number's absolute value
                   (NUMBER(FALSE)(SUCC_MAGNITUDE(ABS(number))))));
                    

// ----------------------------------------------------------------------------
// Declare a few numbers to make testing easier
// ----------------------------------------------------------------------------
var ONE   = SUCC(ZERO);
var TWO   = SUCC(ONE);
var THREE = SUCC(TWO);

var MINUS_ONE   = PRED(ZERO);  
var MINUS_TWO   = PRED(MINUS_ONE);  
var MINUS_THREE = PRED(MINUS_TWO);





