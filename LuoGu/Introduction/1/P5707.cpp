#include <iostream>
#include <cmath>
#include <cstdio>

using std::cin;
using std::cout;
using std::endl;
using std::ceil;
using std::printf;

int main(void)
{
    int s{0}, v{0};
    cin >> s >> v;

    double t = (double)s / (double)v;
    int total_minutes = (int)ceil(t) + 10;
    int arrival_time = 8 * 60;
    int departure_time = arrival_time - total_minutes;

    if (departure_time < 0) {
        departure_time += 24 * 60;
    }

    int hours = departure_time / 60;
    int minutes = departure_time % 60;

    printf("%02d:%02d\n", hours, minutes);
}