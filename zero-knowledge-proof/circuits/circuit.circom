include "../lib/pedersenhash.circom";
include "../../node_modules/circomlib/circuits/bitify.circom"

template Multiplier() {
    signal private input cardOne;
    signal private input cardTwo;
    signal private input cardThree;
    signal private input cardFour;
    var hash = 2638704374621113789445418305741127265043581496304063579228573115028637111616
    component bits2num = Bits2Num(128);
    component num2bits[4];
    component pedersen = PedersenHashSingle();

    num2bits[0] = Num2Bits(32);
    num2bits[1] = Num2Bits(32);
    num2bits[2] = Num2Bits(32);
    num2bits[3] = Num2Bits(32);

    num2bits[0].in <== cardOne;
    num2bits[1].in <== cardTwo;
    num2bits[2].in <== cardThree;
    num2bits[3].in <== cardFour;

    for (var i=0; i<32; i++) {
        bits2num.in[i] <== num2bits[0].out[31-i];
        bits2num.in[i+ 32] <== num2bits[1].out[31-i];
        bits2num.in[i+ 64] <== num2bits[2].out[31-i];
        bits2num.in[i+ 96] <== num2bits[3].out[31-i];
    }
    pedersen.in <== bits2num.out;
    hash === pedersen.encoded;
}
component main = Multiplier();
