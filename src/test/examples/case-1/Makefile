CC = gcc
foo: foo.o

.PHONY: build
build:
	echo "build process"

test:
	echo "test command"

.PHONY: test

var_1 := "variable test 1"
var_2 ::= "variable posix"
var_3 ?= "optional variable"

# Double colon rule
# https://www.gnu.org/software/make/manual/html_node/Double_002dColon.html
double-colon::
	echo "double colon"

double-colon-with-space ::
	echo "double colon with space"

double-requisites:: test
