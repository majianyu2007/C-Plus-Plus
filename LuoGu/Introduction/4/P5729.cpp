#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int w{0}, x{0}, h{0};
    cin >> w >> x >> h;
    int q{0};
    cin >> q;
    static bool removed[21][21][21] = {};
    for (int i = 0; i < q; ++i)
    {
        int x1, y1, z1, x2, y2, z2;
        cin >> x1 >> y1 >> z1 >> x2 >> y2 >> z2;
        for (int xi = x1; xi <= x2; ++xi)
            for (int yi = y1; yi <= y2; ++yi)
                for (int zi = z1; zi <= z2; ++zi)
                {
                    removed[xi][yi][zi] = true;
                }
        if (i == q - 1) {
            int cnt = 0;
            for (int xi = 1; xi <= w; ++xi)
                for (int yi = 1; yi <= x; ++yi)
                    for (int zi = 1; zi <= h; ++zi)
                        if (!removed[xi][yi][zi])
                            ++cnt;
            cout << cnt << endl;
        }
    }

    return 0;
}