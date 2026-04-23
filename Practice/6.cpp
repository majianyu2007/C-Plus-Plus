#include <algorithm>
#include <cmath>
#include <iostream>
#include <string>
#include <vector>

using namespace std;

class CShape {
  protected:
    double rectWidth;
    double rectHeight;

  public:
    CShape(double w, double h) : rectWidth(w), rectHeight(h) {}

    virtual ~CShape() {}

    virtual double Area() const = 0;

    void Show() const {
        cout << "W = " << rectWidth << ", H = " << rectHeight << ", Area = " << Area() << endl;
    }

    bool operator==(const CShape &other) const { return fabs(Area() - other.Area()) < 1e-6; }

    bool operator>(const CShape &other) const { return Area() - other.Area() > 1e-6; }

    bool operator<(const CShape &other) const { return other > *this; }
};

class CRectangle : public CShape {
  public:
    CRectangle(double w, double h) : CShape(w, h) {}

    double Area() const override { return rectWidth * rectHeight; }
};

class CEllipse : public CShape {
  public:
    static const double PI;

    CEllipse(double w, double h) : CShape(w, h) {}

    double Area() const override { return PI * rectWidth * rectHeight / 4.0; }
};

const double CEllipse::PI = 3.1416;

class CDiamond : public CShape {
  public:
    CDiamond(double w, double h) : CShape(w, h) {}

    double Area() const override { return rectWidth * rectHeight / 2.0; }
};

string GetType(CShape *shape) {
    if (dynamic_cast<CRectangle *>(shape) != nullptr) {
        return "(rectangle)";
    }
    if (dynamic_cast<CEllipse *>(shape) != nullptr) {
        return "(ellipse)";
    }
    if (dynamic_cast<CDiamond *>(shape) != nullptr) {
        return "(diamond)";
    }
    return "(unknown)";
}

bool compare(CShape *a, CShape *b) { return (*a) > (*b); }

int main() {
    int num;
    int i, j;
    vector<CShape *> sarr;
    string str;
    double w, h;

    cin >> num;
    for (i = 0; i < num; i++) {
        cin >> str >> w >> h;
        if (str == "R") {
            sarr.push_back(new CRectangle(w, h));
        } else if (str == "E") {
            sarr.push_back(new CEllipse(w, h));
        } else if (str == "D") {
            sarr.push_back(new CDiamond(w, h));
        } else {
            cout << "Input error!" << endl;
        }
    }

    num = static_cast<int>(sarr.size());
    for (i = 0; i < num; i++) {
        sarr[i]->Show();
    }

    for (i = 0; i < num - 1; i++) {
        for (j = i + 1; j < num; j++) {
            if ((*sarr[i]) == (*sarr[j])) {
                cout << "Area of Shape[" << i << "]" << GetType(sarr[i]) << " is equal to Shape["
                     << j << "]" << GetType(sarr[j]) << endl;
            }
        }
    }

    sort(sarr.begin(), sarr.end(), compare);
    for (i = 0; i < num; i++) {
        sarr[i]->Show();
    }

    for (i = 0; i < num; i++) {
        delete sarr[i];
    }

    return 0;
}
