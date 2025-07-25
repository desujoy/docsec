pragma circom 2.1.5;

include "./node_modules/circomlib/circuits/poseidon.circom";

template FileIntegrityProof() {
    // Secret input: The 256-bit SHA-256 hash of the file, split into two 128-bit chunks.
    signal input sha256_hash_inputs[2];

    // Public output: The Poseidon hash of the secret inputs. This is the value stored on-chain.
    signal output poseidon_hash_output;

    // Instantiate a Poseidon hasher that takes 2 inputs.
    component poseidon = Poseidon(2);

    // Connect the secret inputs to the Poseidon component.
    poseidon.inputs[0] <== sha256_hash_inputs[0];
    poseidon.inputs[1] <== sha256_hash_inputs[1];

    // Constrain the public output to be the result of the Poseidon hash.
    poseidon_hash_output <== poseidon.out;
}

// Instantiate the main component.
// The `signal output` declaration inside the template is sufficient
// to make `poseidon_hash_output` a public signal.
component main = FileIntegrityProof();