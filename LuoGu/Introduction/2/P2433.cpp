#include <iostream>
#include <cmath>
#include <iomanip>
using namespace std;

int main(void)
{
    int T;
    cin >> T;
    
    if (T == 1) {
        cout << "I love Luogu!";
    } else if (T == 2) {
        cout << 2 + 4 << " " << 10 - 2 - 4;
    } else if (T == 3) {
        cout << 14 / 4 << "\n" << (14 / 4) * 4 << "\n" << 14 % 4;
    } else if (T == 4) {
        cout << setprecision(6) << 500.0 / 3;
    } else if (T == 5) {
        double time = (double)(260 + 220) / (12 + 20);
        cout << time;
    } else if (T == 6) {
        cout << sqrt(6 * 6 + 9 * 9);
    } else if (T == 7) {
        int balance = 100;
        cout << balance + 10 << "\n";
        balance += 10;
        cout << balance - 20 << "\n";
        balance -= 20;
        cout << 0;
    } else if (T == 8) {
        double r = 5;
        double pi = 3.141593;
        cout << 2 * pi * r << "\n" << pi * r * r << "\n" << (4.0/3.0) * pi * r * r * r;
    } else if (T == 9) {
        int peach = 1;
        for (int i = 0; i < 3; i++) {
            peach = (peach + 1) * 2;
        }
        cout << peach;
    } else if (T == 10) {
        // 8台30分钟：8*30 = x + 30y
        // 10台6分钟：10*6 = x + 6y
        // 解得 y = 7.5, x = 15
        double added_per_min = (8.0 * 30 - 10.0 * 6) / (30.0 - 6.0);
        double initial_tasks = 10.0 * 6 - 6.0 * added_per_min;
        double needed_work = initial_tasks + 10.0 * added_per_min;
        int machines = (int)ceil(needed_work / 10.0);
        cout << machines;
    } else if (T == 11) {
        double time = 100.0 / (8 - 5);
        cout << time;
    } else if (T == 12) {
        cout << 'M' - 'A' + 1 << "\n" << (char)('A' + 17);
    } else if (T == 13) {
        double pi = 3.141593;
        double volume = (4.0/3.0) * pi * (4*4*4 + 10*10*10);
        int edge = (int)pow(volume, 1.0/3.0);
        cout << edge;
    } else if (T == 14) {
        for (int price = 50; price <= 110; price++) {
            int people = 10 + (110 - price);
            if (price * people == 3500) {
                cout << price;
                break;
            }
        }
    }
    
    return 0;
}