// A generic adder function
var adder = val1 => val2 => val1 + val2;

// The increment function can now be created
var incr = adder(1);

// Create a decrement partial function by passing -1 to adder
var decr = adder(-1);  

// Apply a transformation function zero or more times to an arbitrary
// starting value
var ZERO = transform => start_value => start_value;
var ONE  = transform => start_value => transform(start_value);
var TWO  = transform => start_value => transform(transform(start_value));

// Generate the counting numbers
ZERO(incr)(0); // -> 0
ONE(incr)(0);  // -> 1
TWO(incr)(0);  // -> 1

// Increment 5 using the function TWO
TWO(incr)(5); // -> 7

// Decrement 5 using the TWO function
TWO(decr)(5); // -> 3

// Increment the character 'A' using the function TWO
TWO(incr)('A'); // -> '11A' Whisky Tango Foxtrot?!

// Concatenate a character to the end of a string
// This function needs to remember the character being concatenated,
// so we wrap the concat() function call within a partial function
// that can remember the value of "char".
//
// "acc" is the accumulator into which the characters are
// concatenated
var str_concatenate = char => acc => acc.concat(char);

// Join some characters together
ZERO(str_concatenate('+'))('');  // -> ""  
ONE(str_concatenate('+'))('');   // -> "+"  
TWO(str_concatenate('+'))('');   // -> "++" 
