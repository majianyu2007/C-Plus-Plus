#include <iostream>

using namespace std;

int main() {
    // To separate a 20x22 grid of QR codes:
    // - Need 19 horizontal cuts to separate 20 rows
    // - Need 21 vertical cuts to separate 22 columns
    // - Need 4 cuts for the unprintable borders
    // Total: 19 + 21 + 4 = 44 cuts

    int rows = 20;
    int cols = 22;
    int border_cuts = 4;

    int cuts = (rows - 1) + (cols - 1) + border_cuts;

    cout << cuts << endl;

    return 0;
}
