#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int refToArray[] = {10,11};
    int var = 1;
    refToArray[var-1] = var = 2;
    cout << refToArray[0] << " " << refToArray[1] << endl;

    return 0;
}