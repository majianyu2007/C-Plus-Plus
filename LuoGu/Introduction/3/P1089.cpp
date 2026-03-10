#include <iostream>

using std::cin;
using std::cout;
using std::endl;

#define PIN 300

int main(void)
{
    int save{0}, pocket{0}, X{0};
    bool status = true;

    for (int i = 0; i < 12; ++i)
    {
        int budget{0};
        cin >> budget;
        pocket += PIN;
        if (pocket < budget)
        {
            X = i + 1;
            status = false;
            break;
        }
        pocket -= budget;
        while (pocket >= 100)
        {
            pocket -= 100;
            save += 100;
        }
    }

    if (status && !X) cout << pocket + save + save / 5 << endl;
    if (!status && X) cout << -X << endl;

    return 0;
}