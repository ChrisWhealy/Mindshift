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
var add5      = adder(5);      // ->      add5 = q => q+5



// ********************************************************************
// Function Composition
// ********************************************************************
var compose = fn1 => fn2 => val => fn2(fn1(val));

// Now we can "compose" double and add5 into a single function
var doubleAndAdd5 = compose(double)(add5);



// ********************************************************************
// Reification functions
// ********************************************************************
var to_integer = qtyFn => qtyFn(incr)(0);  
var to_string  = qtyFn => qtyFn(asPlusChar)('');
var to_boolean = fn    => fn(true)(false);



// ********************************************************************
// Basic Combinators
// ********************************************************************
var IDENTITY = val => val;
var U        = fn  => fn(fn);

var IDIOT = IDENTITY;

// Y-Combinator
var Y = (rec_fn =>  
          (gen_rec => U(gen_rec))
          (gen_rec => rec_fn((n,a,b) => U(gen_rec)(n,a,b))))

// ********************************************************************
// Functions that operate on pairs
// ********************************************************************
var PAIR = val1 => val2 => fn => fn(val1)(val2);

var TRUE  = true_part => false_part => true_part;  
var FALSE = true_part => false_part => false_part;  

var HEAD = pair => pair(TRUE);  
var TAIL = pair => pair(FALSE);

var EMPTY = PAIR(null)(null);



// ********************************************************************
// Define an abstract quantity function for ZERO.
// ********************************************************************
var ZERO = transform => start_value => start_value;



// ********************************************************************
// Successor and predecessor functions
// ********************************************************************
var SUCC =  
  qtyFn =>
    transform =>
      start_value =>
        transform(qtyFn(transform)(start_value));

var SUCC_PAIR = pair  => PAIR(pair(FALSE))(SUCC(pair(FALSE)));  
var PRED      = qtyFn => qtyFn(SUCC_PAIR)(PAIR(ZERO)(ZERO))(TRUE);



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
var SUBTRACT = qtyFn1 => qtyFn2 => qtyFn2(PRED)(qtyFn1);

// Division requires the use of the Y-Combinator
var do_div =  
  div_next =>
    count =>
      pair => IS_LTE(pair(FALSE))(pair(TRUE))
              (fn =>
                 (div_next(SUCC(count))
                          (PAIR(SUBTRACT(pair(TRUE))(pair(FALSE)))
                               (pair(FALSE))))
                 (fn))
              (PAIR(count)(pair(TRUE)));

var DIV = val1 => val2 => Y(do_div)(ZERO)(PAIR(val1)(val2));
var MOD = val1 => val2 => Y(do_div)(ZERO)(PAIR(val1)(val2))(FALSE);



// ********************************************************************
// Boolean Operators
// ********************************************************************
var NOT = bool => bool(FALSE)(TRUE);  

var AND = bool1 => bool2 => bool1(bool2)(FALSE);  
var OR  = bool1 => bool2 => bool1(TRUE)(bool2);  
var XOR = bool1 => bool2 => bool1(NOT(bool2))(bool2);



// ********************************************************************
// Predicate functions
// ********************************************************************
var IS_ZERO = qtyFn => qtyFn(dont_care => FALSE)(TRUE);
var IS_LTE  = val1  => val2 => IS_ZERO(SUBTRACT(val1)(val2));
var IS_LT   = val1 => val2 => NOT(IS_LTE(val2)(val1));  



var is_empty = pair => (HEAD(pair) === null) &&  
                       (TAIL(pair) === null);
var is_last  = pair => is_empty(TAIL(pair));



// ********************************************************************
// Create functions to be called recursively by the Y-Combinator:
//   do_fib  - Calculate one step of the Fibonacci series
//   do_fact - Calculate one step in the factorial calculation
// ********************************************************************
var do_fib = fib_next => (n,a,b) => n < 1 ? a : fib_next(n-1,b,a+b);
var fib    = Y(do_fib);

var do_fact = fact_next => n => n < 2 ? 1 : n * fact_next(n-1);
var fact    = Y(do_fact);



// ********************************************************************
// Convert a character string to a list and vice versa whilst
// preserving the character order
// ********************************************************************
var make_str2list =  
  fn_next=>
    list =>
      str => (str.length > 0)
             ? fn_next(PAIR(str.substr(-1))(list))(str.slice(0,-1))
             : list;

var make_list2str =  
  fn_next=>
    str =>
      list => is_last(list)
              ? str.concat(HEAD(list))
              : fn_next(str.concat(HEAD(list)))(TAIL(list));

var str2list = str  => Y(make_str2list)(EMPTY)(str);
var list2str = list => Y(make_list2str)("")(list);



// ********************************************************************
// Convert a JavaScript array into a list and vice versa
// ********************************************************************

// Create our own push function that returns the new array rather than
// the index of the newly inserted item
var push = arr => val => (idx => arr)(arr.push(val));

var make_array2list =  
  fn_next=>
    list =>
      array => (array.length === 0)
               ? list
               : fn_next(PAIR(array[array.length-1])(list))
                        (array.slice(0,-1));

var make_list2array =  
  fn_next=>
    arr =>
      list => is_last(list)
              ? push(arr)(HEAD(list))
              : fn_next(push(arr)(HEAD(list)))(TAIL(list));

var array2list = Y(make_array2list)(EMPTY);
var list2array = list => Y(make_list2array)([])(list);


