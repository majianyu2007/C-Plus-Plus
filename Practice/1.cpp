#include <iostream>
#include <iomanip>

using std::cin;
using std::cout;
using std::endl;
using std::dec;
using std::oct;
using std::hex;
using std::nouppercase;
using std::uppercase;

void Print(int n, int base=10, bool bUpper=false)
{

    cout << "Dec: " << dec << n << endl;
    cout << "Oct: " << oct << n << endl;
    cout << "Hex: " << hex << nouppercase << n << endl;
    cout << "Hex: " << hex << uppercase << n << endl;
}

int main()
{
    int n{0};
    int base{10};
    bool bUpper = false;
    cin >> n;
    Print(n);
    return 0;
}
