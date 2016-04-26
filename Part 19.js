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
// Basic Combinators
// ----------------------------------------------------------------------------
var IDENTITY = val => val;
var U        = fn  => fn(fn);

// Y-Combinator
var Y = (rec_fn =>  
          (gen_rec => U(gen_rec))
          (gen_rec => rec_fn((n,a,b) => U(gen_rec)(n,a,b))))



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

var ADD_MAGNITUDES      = qtyFn1 => qtyFn2 => qtyFn1(SUCC_MAGNITUDE)(qtyFn2);
var SUBTRACT_MAGNITUDES = qtyFn1 => qtyFn2 => qtyFn2(PRED_MAGNITUDE)(qtyFn1);
var MULTIPLY_MAGNITUDES = qtyFn1 => qtyFn2 => qtyFn1(ADD_MAGNITUDES(qtyFn2))
                                                    (ZERO_MAGNITUDE);



// ----------------------------------------------------------------------------
// Numeric predicates
// ----------------------------------------------------------------------------

// Numeric predicates returning abstract functions
var IS_POS = number => HEAD(number);

// Numeric predicates returning native data types
var is_pos  = number => to_boolean(HEAD(number));

var IS_ZERO_MAGNITUDE = qtyFn => qtyFn(dont_care => FALSE)(TRUE);
var IS_MAGNITUDE_LTE  =
  qtyFn1 =>
    qtyFn2 =>
      IS_ZERO_MAGNITUDE(SUBTRACT_MAGNITUDES(qtyFn1)(qtyFn2));

var HAS_ZERO_MAGNITUDE = number => ABS(number)(dont_care => FALSE)(TRUE);
var HAS_UNIT_MAGNITUDE = number => magnitude(ABS(number)) === 1 ? TRUE : FALSE;

var IS_ONE       = number => HAS_UNIT_MAGNITUDE(number);
var IS_ZERO      = number => HAS_ZERO_MAGNITUDE(number);
var IS_MINUS_ONE = number => AND(NOT(IS_POS(number)))
                                (HAS_UNIT_MAGNITUDE(number));

var IS_LTE =
  num1 =>
    num2 =>
      HAS_ZERO_MAGNITUDE(SUBTRACT_MAGNITUDES(ABS(num2))
                                            (ABS(num1)));



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
// Arithmetic Operators - Addition
//
// When both numbers have the same sign, then addition is simply the sum of the
// magnitudes with the sign preserved
//   (+)(n1) + (+)(n2) = NUMBER(TRUE)(ADD(n1)(n2))
//   (-)(n1) + (-)(n2) = NUMBER(FALSE)(ADD(n1)(n2))
//
// When the signs are different, we must examine each number's magnitude
//   (+)(n1) + (-)(n2) = IS_LTE(n2)(n1)
//                             (NUMBER(TRUE)(SUBTRACT(n1)(n2)))
//                             (NUMBER(FALSE)(SUBTRACT(n2)(n1)))
//
//   (-)(n1) + (+)(n2) = IS_LTE(n1)(n2)
//                             (NUMBER(TRUE)(SUBTRACT(n2)(n1)))
//                             (NUMBER(FALSE)(SUBTRACT(n1)(n2)))
// ----------------------------------------------------------------------------

var ADD =
  num1 =>
    num2 =>
      // Inner function
      (qtyFn1 => qtyFn2 =>
        // Is the 1st number +ve?
        IS_POS(num1)
              // Yup, what's the sign of the 2nd number?
              (IS_POS(num2)
                     // Both numbers are +ve
                     // Return sum of magnitudes and +ve sign
                     (NUMBER(TRUE)(ADD_MAGNITUDES(qtyFn1)(qtyFn2)))
                     // 2nd number is -ve
                     // Which number is bigger?
                     (IS_LTE(num2)(num1)
                            // 1st number is bigger
                            // Subtract 2nd number from 1st and return with +ve sign
                            (NUMBER(TRUE)(SUBTRACT_MAGNITUDES(qtyFn1)(qtyFn2)))
                            // 2nd number is bigger
                            // Subtract 1st number from 2nd and return with -ve sign
                            (NUMBER(FALSE)(SUBTRACT_MAGNITUDES(qtyFn2)(qtyFn1)))))
              // Nope, what's the sign of the 2nd number?
              (IS_POS(num2)
                     // 2nd number is +ve
                     // Which number is bigger?
                     (IS_LTE(num1)(num2)
                            // 2nd number is bigger
                            // Subtract 1st number from 2nd and return with +ve sign
                            (NUMBER(TRUE)(SUBTRACT_MAGNITUDES(qtyFn2)(qtyFn1)))
                            // 1st number is bigger
                            // Subtract 2nd number from 1st and return with -ve sign
                            (NUMBER(FALSE)(SUBTRACT_MAGNITUDES(qtyFn1)(qtyFn2))))
                     // Both numbers are -ve
                     // Return sum of magnitudes with -ve sign
                     (NUMBER(FALSE)(ADD_MAGNITUDES(qtyFn1)(qtyFn2))))
      )
      // Pass the absolute values of these numbers to inner function
      (ABS(num1))
      (ABS(num2));


// ----------------------------------------------------------------------------
// Arithmetic Operators - Subtraction
//
// The function SUBTRACT is now simply an interface to ADD in which the sign
// of the second number has been flipped
//   (+)(n1) - (+)(n2) --> (+)(n1) + (-)(n2)
//   (+)(n1) - (-)(n2) --> (+)(n1) + (+)(n2)
//   (-)(n1) - (+)(n2) --> (-)(n1) + (-)(n2)
//   (-)(n1) - (-)(n2) --> (-)(n1) + (+)(n2)
// ----------------------------------------------------------------------------

var SUBTRACT = num1 => num2 => ADD(num1)(NUMBER(NOT(SIGN(num2)))(ABS(num2)));




// ----------------------------------------------------------------------------
// Arithmetic Operators - Multiplication
// 
// The result is the NUMBER formed from not-xor'ing the signs together then
// multiplying the magnitudes
// ----------------------------------------------------------------------------
var MULTIPLY = num1 => num2 => NUMBER(NOT(XOR(SIGN(num1))(SIGN(num2))))
                                     (MULTIPLY_MAGNITUDES(ABS(num1))(ABS(num2)));




// ----------------------------------------------------------------------------
// Arithmetic Operators - Division (requires the use of the Y-Combinator)
//
// The result is the NUMBER formed from not-xor'ing the signs together then
// dividing the magnitudes
// ----------------------------------------------------------------------------
var do_div_magnitudes =  
   div_next =>
     count =>
       pair => 
         // Inner function
         (remainder => divisor => 
            IS_MAGNITUDE_LTE(divisor)(remainder)
                            (fn =>
                               (div_next(SUCC_MAGNITUDE(count))
                                        (PAIR(SUBTRACT_MAGNITUDES(remainder)(divisor))
                                             (divisor)))
                               (fn))
                            (PAIR(count)(remainder)))
         // Supply parameters to inner function
         (HEAD(pair))
         (TAIL(pair));


var DIV = num1 => num2 =>
   NUMBER(NOT(XOR(SIGN(num1))(SIGN(num2))))
         (Y(do_div_magnitudes)
           (ZERO_MAGNITUDE)
           (PAIR(ABS(num1))(ABS(num2))));

// Helper functions to reify the NUMBER function returned by DIV
var magnitude_quot = numFn => magnitude(HEAD(TAIL(numFn)));
var magnitude_rem  = numFn => magnitude(TAIL(TAIL(numFn)));

var div_result = numFn =>
  ({ isPos : sign(numFn),
     quot  : magnitude_quot(numFn),
     rem   : magnitude_rem(numFn)
  });



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

var MINUS_ONE   = PRED(ZERO);
var MINUS_TWO   = PRED(MINUS_ONE);
var MINUS_THREE = PRED(MINUS_TWO);
var MINUS_FOUR  = PRED(MINUS_THREE);
var MINUS_FIVE  = PRED(MINUS_FOUR);
var MINUS_SIX   = PRED(MINUS_FIVE);  
var MINUS_SEVEN = PRED(MINUS_SIX);  
var MINUS_EIGHT = PRED(MINUS_SEVEN);  
var MINUS_NINE  = PRED(MINUS_EIGHT);  
var MINUS_TEN   = PRED(MINUS_NINE);  





