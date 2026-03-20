#include <iostream>
#include <iomanip>
#include <string>

using std::cin;
using std::cout;
using std::endl;
using std::string;
using std::setfill;
using std::setw;

class CTime {
private:
    int hour;
    int minute;
    int second;

    bool isValid(int h, int m, int s) const {
        return h >= 0 && h < 24 && m >= 0 && m < 60 && s >= 0 && s < 60;
    }

public:
    CTime(int h = 0, int m = 0, int s = 0) {
        if (isValid(h, m, s)) {
            hour = h;
            minute = m;
            second = s;
        } else {
            hour = minute = second = 0;
        }
    }

    int getHour() const { return hour; }
    int getMinute() const { return minute; }
    int getSecond() const { return second; }

    void setHour(int h) {
        if (h >= 0 && h < 24) hour = h;
    }

    void setMinute(int m) {
        if (m >= 0 && m < 60) minute = m;
    }

    void setSecond(int s) {
        if (s >= 0 && s < 60) second = s;
    }

    void display24() const {
        cout << setfill('0') << setw(2) << hour << ":"
             << setw(2) << minute << ":"
             << setw(2) << second << endl;
    }

    void display12() const {
        int h12 = hour;
        string period = "AM";
        if (hour >= 12) {
            period = "PM";
            if (hour > 12) h12 = hour - 12;
        }
        if (hour == 0) h12 = 12;
        
        cout << setfill('0') << setw(2) << h12 << ":"
             << setw(2) << minute << ":"
             << setw(2) << second << " " << period << endl;
    }
};

int main() {
    CTime t1(14, 30, 45);
    cout << "24-hour format: ";
    t1.display24();
    cout << "12-hour format: ";
    t1.display12();

    CTime t2(23, 59, 59);
    cout << "\n24-hour format: ";
    t2.display24();
    cout << "12-hour format: ";
    t2.display12();

    CTime t3(0, 15, 30);
    cout << "\n24-hour format: ";
    t3.display24();
    cout << "12-hour format: ";
    t3.display12();

    CTime t4(12, 0, 0);
    cout << "\n24-hour format: ";
    t4.display24();
    cout << "12-hour format: ";
    t4.display12();

    CTime t5(25, 70, 80);
    cout << "\nInvalid time - defaults to: ";
    t5.display24();

    return 0;
}