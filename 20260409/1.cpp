#include <cmath>
#include <iostream>

using std::cin;
using std::cout;
using std::endl;
using std::fabs;

template <typename T> void bubble_sort(T *items, int count, bool verbose = false) {
    int a, b;
    int number_compare = 0;
    int number_move = 0;
    for (a = 1; a < count; a++) {
        bool indicator = 0;
        for (b = count - 1; b >= a; b--) {
            number_compare++;
            if (items[b - 1] > items[b]) {
                number_move++;
                T t = items[b - 1];
                items[b - 1] = items[b];
                items[b] = t;
                indicator = 1;
            }
        }
        if (indicator == 0)
            break;
    }
    if (verbose) {
        cout << "Number of comparisons: " << number_compare << endl;
        cout << "Number of moves: " << number_move << endl;
    }
}

class Cuboid {
  private:
    double L, W, H;

  public:
    Cuboid(double l = 1.0, double w = 1.0, double h = 1.0) : L(l), W(w), H(h) {}

    bool IsEqual(const Cuboid &other) const {
        double side1[3] = {L, W, H};
        double side2[3] = {other.L, other.W, other.H};
        bubble_sort(side1, 3);
        bubble_sort(side2, 3);

        const double eps = 1e-8;
        for (int i = 0; i < 3; ++i) {
            if (fabs(side1[i] - side2[i]) > eps)
                return false;
        }
        return true;
    }

    double GetVolume() const { return L * W * H; }
};

int main(void) {
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);

    double l1, w1, h1;
    double l2, w2, h2;

    cout << "请输入第一个长方体的长、宽、高：";
    if (!(cin >> l1 >> w1 >> h1))
        return 0;

    cout << "请输入第二个长方体的长、宽、高：";
    if (!(cin >> l2 >> w2 >> h2))
        return 0;

    Cuboid c1(l1, w1, h1);
    Cuboid c2(l2, w2, h2);

    cout << "第一个长方体体积为：" << c1.GetVolume() << endl;
    cout << "第二个长方体体积为：" << c2.GetVolume() << endl;
    cout << (c1.IsEqual(c2) ? "这是两个完全一样的长方体！" : "这两个长方体并不一致！") << endl;

    return 0;
}
